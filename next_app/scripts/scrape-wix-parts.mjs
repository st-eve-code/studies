/**
 * Xtreme Power Sports Parts — Wix Store Scraper
 * ==============================================
 * Scrapes product data from https://www.xtremepowersportsparts.com
 * (a Wix e-commerce store). Wix renders product details client-side, so we
 * load each product page in a real browser and read the rendered DOM.
 *
 * Usage:  node scripts/scrape-wix-parts.mjs
 * Output: data/scraped-parts.json  (merged into the app's /api/parts endpoint)
 */

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const OUT_FILE = path.join(DATA_DIR, "scraped-parts.json");
const SITEMAP = "https://www.xtremepowersportsparts.com/store-products-sitemap.xml";
const BASE = "https://www.xtremepowersportsparts.com";

const VIEWPORT = { width: 1920, height: 1080 };
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Full-res image: drop the w_xxx sizing segment so we get the original. */
function fullRes(url) {
  if (!url) return url;
  return url.replace(/\/v1\/(?:fill|fit|crop)[^/]*\//, "/v1/original/");
}

function cleanText(s) {
  return (s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🏪 Xtreme Power Sports Parts — Wix Store Scraper\n" + "=".repeat(52));

  // 1. Grab all product URLs from the store sitemap
  const smRes = await fetch(SITEMAP);
  const smXml = await smRes.text();
  const urls = [...smXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  console.log(`✓ ${urls.length} product URLs from sitemap`);

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: VIEWPORT,
    locale: "en-US",
    timezoneId: "America/New_York",
    ignoreHTTPSErrors: true,
  });

  // Block heavy media (Wix images are huge); we only need the URL strings.
  await context.route(/\.(?:jpe?g|png|webp|gif|svg|woff2?|ttf|mp4)(\?|$)/i, (route) => route.abort());
  const page = await context.newPage();

  const products = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
      await page.waitForSelector('[data-hook="product-title"]', { timeout: 30_000 }).catch(() => {});

      const data = await page.evaluate(() => {
        const q = (sel) => document.querySelector(sel)?.textContent?.trim() ?? "";
        const qa = (sel) => Array.from(document.querySelectorAll(sel)).map((el) => el.textContent.trim());

        const name = q('[data-hook="product-title"]');
        const priceText = q('[data-hook="formatted-primary-price"]') || q('[data-hook="product-price"]');
        const price = parseFloat((priceText || "").replace(/[^0-9.]/g, ""));

        const skuEl = document.querySelector('[data-hook="sku"]');
        const sku = (skuEl?.textContent || "").replace(/^SKU:?\s*/i, "").trim();

        const images = Array.from(document.querySelectorAll('[data-hook="main-media"] img, [data-hook="thumbnail-image"] img, [data-hook="ProductImageDataHook.ProductImage"] img'))
          .map((img) => {
            const src = img.getAttribute("src") || img.getAttribute("srcset")?.split(",")[0] || "";
            return src.split(" ")[0];
          })
          .filter(Boolean);

        const description = q('[data-hook="description"]');
        const infoTitles = qa('[data-hook="info-section-title"]');
        const infoBodies = qa('[data-hook="info-section-description"]');

        const details = {};
        for (let j = 0; j < infoTitles.length; j++) {
          details[infoTitles[j]] = infoBodies[j];
        }

        const inStock = !!document.querySelector('[data-hook="add-to-cart"]:not([disabled])');

        return { name, price, sku, images, description, details, inStock, availabilityText: q('[data-hook="availability"]') };
      });

      if (data.name) {
        products.push({ url, ...data });
        console.log(`✓ ${String(i + 1).padStart(3)}/${urls.length} ${data.name.slice(0, 60)} — $${data.price || "?"}`);
      } else {
        console.log(`✗ ${String(i + 1).padStart(3)}/${urls.length} no name @ ${url}`);
      }
    } catch (err) {
      console.log(`✗ ${String(i + 1).padStart(3)}/${urls.length} ERROR ${String(err).slice(0, 120)} @ ${url}`);
    }
    await delay(300);
  }

  await browser.close();

  console.log(`\n✅ ${products.length} products scraped`);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(products, null, 2), "utf8");
  console.log(`💾 Saved: ${OUT_FILE}`);
  console.log("\n🎉 Done!\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
