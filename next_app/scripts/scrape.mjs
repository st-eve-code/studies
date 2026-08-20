/**
 * Xtreme Powersports Inc. — Stealth Product Scraper v2
 * ======================================================
 * Uses Playwright with stealth headers + realistic browser fingerprinting.
 *
 * Usage:  node scripts/scrape.mjs
 *
 * Outputs:
 *   data/scraped-vehicles.json
 *   data/scraped-parts.json
 */

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

// ── Stealth browser config ────────────────────────────────────────────────────

const LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-blink-features=AutomationControlled",
  "--disable-features=IsolateOrigins,site-per-process",
  "--disable-web-security",
  "--window-size=1920,1080",
  "--start-maximized",
  "--lang=en-US,en",
];

const VIEWPORT = { width: 1920, height: 1080 };

// Rotate between realistic desktop user agents
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

const EXTRA_HEADERS = {
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (base, spread = 500) => base + Math.floor(Math.random() * spread);

function cleanText(str) {
  return str?.replace(/\s+/g, " ").trim() ?? "";
}

function extractPrice(text) {
  const match = text?.match(/\$[\d,]+(\.\d{2})?/);
  if (!match) return null;
  return parseFloat(match[0].replace(/[$,]/g, ""));
}

function isProductImage(src) {
  if (!src) return false;
  if (/\.(svg|gif|woff|ttf|eot)(\?|$)/i.test(src)) return false;
  if (/(icon|logo-\d|sprite|pixel|track|advert|banner|1x1)/i.test(src)) return false;
  return /\.(jpe?g|png|webp)(\?|$)/i.test(src) || /\/image\//i.test(src);
}

/** Remove query strings that shrink images and replace with high-res variants */
function upgradeImageUrl(url) {
  if (!url) return url;
  // BRP / Can-Am / Sea-Doo / Ski-Doo — Scene7 image server: strip resize transforms
  url = url.replace(/\?.*?(wid|hei|fmt).*$/i, "?fmt=png-alpha&wid=1200");
  // Polaris Scene7
  url = url.replace(/\?.*?wid=\d+.*$/i, "?wid=1200&fmt=jpeg");
  // Yamaha — strip small thumb params
  url = url.replace(/[?&](size|width|w)=\d+/gi, "");
  return url;
}

// ── Page setup — apply stealth patches to every new page ─────────────────────

async function stealthPage(context, referer = "") {
  const page = await context.newPage();
  await page.setViewportSize(VIEWPORT);
  await page.setExtraHTTPHeaders({
    ...EXTRA_HEADERS,
    ...(referer ? { Referer: referer } : {}),
  });

  // Patch navigator.webdriver = false
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
    window.chrome = { runtime: {} };
  });

  return page;
}

/** Navigate with retry on transient failures */
async function goto(page, url, waitUntil = "domcontentloaded") {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(url, { waitUntil, timeout: 30_000 });
      return true;
    } catch (err) {
      console.warn(`    attempt ${attempt}/3 failed: ${err.message}`);
      if (attempt < 3) await delay(jitter(2000, 1000));
    }
  }
  return false;
}

// ── Source definitions ────────────────────────────────────────────────────────

const VEHICLE_SOURCES = [
  // BRP (Can-Am, Sea-Doo, Ski-Doo) — public media server, no bot protection
  {
    brand: "Can-Am",
    category: "utv",
    url: "https://www.can-am.brp.com/off-road/models.html",
    cardSelector: "[class*='vehicle-card'], [class*='model-card'], [class*='product-card'], article",
    nameSelector: "h2, h3, [class*='title'], [class*='name']",
    imgSelector: "img",
    priceSelector: "[class*='price'], [class*='msrp']",
    waitFor: "[class*='model'], article",
  },
  {
    brand: "Polaris",
    category: "utv",
    url: "https://www.polaris.com/en-us/off-road/rzr/",
    cardSelector: "[class*='vehicle'], [class*='product'], [class*='model'], article",
    nameSelector: "h2, h3, [class*='title']",
    imgSelector: "img",
    priceSelector: "[class*='price']",
    waitFor: "img",
  },
  {
    brand: "Yamaha",
    category: "atv",
    url: "https://www.yamahamotorsports.com/atv",
    cardSelector: "[class*='product'], [class*='model'], [class*='vehicle'], article, li",
    nameSelector: "h2, h3, h4, [class*='title']",
    imgSelector: "img",
    priceSelector: "[class*='price'], [class*='msrp']",
    waitFor: "img",
  },
  {
    brand: "Honda",
    category: "atv",
    url: "https://powersports.honda.com/all-terrain-vehicles",
    cardSelector: "[class*='product'], [class*='model'], [class*='vehicle'], article",
    nameSelector: "h2, h3, [class*='title'], [class*='name']",
    imgSelector: "img",
    priceSelector: "[class*='price'], [class*='msrp']",
    waitFor: "img",
  },
  {
    brand: "Kawasaki",
    category: "atv",
    url: "https://www.kawasaki.com/en-us/products/atv-side-x-side",
    cardSelector: "[class*='product'], [class*='model'], article, li[class*='item']",
    nameSelector: "h2, h3, [class*='title']",
    imgSelector: "img",
    priceSelector: "[class*='price']",
    waitFor: "img",
  },
  {
    brand: "KTM",
    category: "dirt-bike",
    url: "https://www.ktm.com/en-us/models/motocross.html",
    cardSelector: "[class*='model'], [class*='bike'], article, li[class*='item']",
    nameSelector: "h2, h3, [class*='title'], [class*='name']",
    imgSelector: "img",
    priceSelector: "[class*='price'], [class*='msrp']",
    waitFor: "[class*='model'], img",
  },
  {
    brand: "Sea-Doo",
    category: "personal-watercraft",
    url: "https://www.sea-doo.com/en-us/personal-watercraft",
    cardSelector: "[class*='vehicle'], [class*='model'], [class*='product'], article",
    nameSelector: "h2, h3, [class*='title']",
    imgSelector: "img",
    priceSelector: "[class*='price']",
    waitFor: "img",
  },
  {
    brand: "Ski-Doo",
    category: "snowmobile",
    url: "https://www.ski-doo.com/en/snowmobiles",
    cardSelector: "[class*='vehicle'], [class*='model'], [class*='product'], article",
    nameSelector: "h2, h3, [class*='title']",
    imgSelector: "img",
    priceSelector: "[class*='price']",
    waitFor: "img",
  },
  {
    brand: "CFMOTO",
    category: "utv",
    url: "https://www.cfmoto.com/en-us/",
    cardSelector: "[class*='product'], [class*='model'], article, [class*='item']",
    nameSelector: "h2, h3, [class*='title'], [class*='name']",
    imgSelector: "img",
    priceSelector: "[class*='price'], [class*='msrp']",
    waitFor: "img",
  },
];

const PARTS_SOURCES = [
  {
    category: "exhaust",
    brand: "FMF Racing",
    url: "https://www.fmfracing.com/4Stroke-Exhaust",
    cardSelector: "[class*='product'], [class*='item'], article",
    nameSelector: "h2, h3, [class*='title'], [class*='name']",
    imgSelector: "img",
    priceSelector: "[class*='price']",
  },
  {
    category: "suspension",
    brand: "Fox Racing Shox",
    url: "https://www.ridefox.com/collection_list.php?category=UTVShocks",
    cardSelector: "[class*='product'], [class*='item'], article",
    nameSelector: "h2, h3, [class*='title'], [class*='name']",
    imgSelector: "img",
    priceSelector: "[class*='price']",
  },
  {
    category: "riding-gear",
    brand: "Troy Lee Designs",
    url: "https://www.troyledesigns.com/collections/helmets",
    cardSelector: "[class*='product'], [class*='item'], article, li[class*='grid']",
    nameSelector: "h2, h3, [class*='title'], [class*='name']",
    imgSelector: "img",
    priceSelector: "[class*='price']",
  },
  {
    category: "tires-wheels",
    brand: "ITP",
    url: "https://www.itptires.com/products/",
    cardSelector: "[class*='product'], [class*='item'], article",
    nameSelector: "h2, h3, [class*='title'], [class*='name']",
    imgSelector: "img",
    priceSelector: "[class*='price']",
  },
  {
    category: "protection",
    brand: "Moose Racing",
    url: "https://mooseracing.com/products/skid-plates",
    cardSelector: "[class*='product'], [class*='item'], article, li[class*='product']",
    nameSelector: "h2, h3, [class*='title'], [class*='name']",
    imgSelector: "img",
    priceSelector: "[class*='price']",
  },
];

// ── Core scraper function ─────────────────────────────────────────────────────

async function scrapePage(page, source) {
  const results = [];
  console.log(`    → navigating to ${source.url}`);
  const ok = await goto(page, source.url, "networkidle");
  if (!ok) { console.warn("    ✗ failed to load"); return results; }

  // Wait for product content
  try {
    await page.waitForSelector(source.waitFor ?? "img", { timeout: 12_000 });
  } catch { /* proceed anyway */ }

  // Scroll to trigger lazy-load
  await page.evaluate(() => {
    return new Promise((resolve) => {
      let y = 0;
      const step = () => {
        window.scrollBy(0, 300);
        y += 300;
        if (y < document.body.scrollHeight) setTimeout(step, 80);
        else resolve();
      };
      step();
    });
  });
  await delay(jitter(800, 400));

  // Extract product cards
  const cards = await page.evaluate((src) => {
    const selectors = src.cardSelector.split(",").map(s => s.trim());
    let nodes = [];
    for (const sel of selectors) {
      const found = Array.from(document.querySelectorAll(sel));
      if (found.length >= 2) { nodes = found; break; }
    }
    if (nodes.length === 0) nodes = Array.from(document.querySelectorAll("a:has(img)"));

    return nodes.slice(0, 24).map(card => {
      // Name
      const nameSelectors = src.nameSelector.split(",").map(s => s.trim());
      let name = "";
      for (const ns of nameSelectors) {
        const el = card.querySelector(ns);
        if (el?.textContent?.trim().length > 2) { name = el.textContent.trim(); break; }
      }
      // Fallback to img alt
      if (!name) name = card.querySelector("img")?.alt ?? "";

      // Image — prefer highest resolution source
      const img = card.querySelector(src.imgSelector ?? "img");
      const imgSrc =
        img?.dataset?.src ||
        img?.dataset?.lazySrc ||
        img?.dataset?.original ||
        img?.dataset?.srcset?.split(" ")[0] ||
        img?.src ||
        img?.srcset?.split(",").pop()?.trim().split(" ")[0] ||
        "";

      // Price
      const priceSelectors = src.priceSelector?.split(",").map(s => s.trim()) ?? ["[class*='price']"];
      let priceText = "";
      for (const ps of priceSelectors) {
        const el = card.querySelector(ps);
        if (el) { priceText = el.textContent; break; }
      }

      // Link
      const link = card.tagName === "A" ? card.href : card.querySelector("a")?.href ?? "";

      return { name: name.replace(/\s+/g, " ").trim(), imgSrc, priceText, link };
    });
  }, source);

  for (const card of cards) {
    if (!card.name || card.name.length < 3) continue;
    const imgUrl = upgradeImageUrl(card.imgSrc);
    if (!imgUrl || !isProductImage(imgUrl)) continue;

    const price = extractPrice(card.priceText);
    results.push({
      name: card.name,
      brand: source.brand ?? "",
      category: source.category ?? "accessories",
      image: imgUrl,
      price,
      sourceUrl: card.link || source.url,
    });
  }

  console.log(`    ✓ ${results.length} products extracted`);
  return results;
}

// ── Build structured records ──────────────────────────────────────────────────

let vehicleCounter = 200;
let partCounter = 200;

function guessCategory(name, fallback) {
  const n = name.toLowerCase();
  if (/(watercraft|jet.ski|rxp|rxt|gti|spark|ultra)/.test(n)) return "personal-watercraft";
  if (/(snowmobile|sled|summit|mxz|freeride|renegade.sled)/.test(n)) return "snowmobile";
  if (/(dirt.bike|motocross|sx|mx|yz|crf\d|kx\d|exc|enduro)/.test(n)) return "dirt-bike";
  if (/(utv|side.by.side|rzr|maverick|defender|ranger|general|talon|pioneer|viking|teryx|krx)/.test(n)) return "utv";
  if (/(street|cbr|ninja|gsxr|r1|r6|mt.|duke|supersport)/.test(n)) return "street-bike";
  return fallback ?? "atv";
}

function buildVehicle(raw) {
  const id = `v-sc-${++vehicleCounter}`;
  const yearMatch = raw.name.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  const model = raw.name.replace(/\b20\d{2}\b/, "").replace(/\s+/g, " ").trim();

  return {
    id,
    stockNumber: `XPS-${vehicleCounter}`,
    condition: "new",
    category: guessCategory(raw.name, raw.category),
    year,
    make: raw.brand,
    model: model || raw.name,
    price: raw.price ?? Math.floor(Math.random() * 20000) + 6000,
    color: "See Dealer",
    images: [raw.image],
    specs: {},
    features: [],
    description: `${year} ${raw.brand} ${model}. Contact us for full specs and availability.`,
    status: "in-stock",
    isFeatured: vehicleCounter % 5 === 0,
    isNew: true,
    sourceUrl: raw.sourceUrl,
    createdAt: new Date().toISOString(),
  };
}

function buildPart(raw) {
  const id = `p-sc-${++partCounter}`;
  return {
    id,
    sku: `SC-${id.toUpperCase()}`,
    name: raw.name,
    brand: raw.brand,
    category: raw.category,
    type: "aftermarket",
    price: raw.price ?? Math.floor(Math.random() * 400) + 30,
    images: [raw.image],
    shortDescription: raw.name,
    description: `${raw.name} by ${raw.brand}.`,
    specs: {},
    fitment: [],
    availability: "in-stock",
    stockQty: 10,
    isFeatured: partCounter % 4 === 0,
    rating: 4.5,
    reviewCount: 0,
    tags: [raw.category, raw.brand.toLowerCase().replace(/\s+/g, "-")],
    sourceUrl: raw.sourceUrl,
    createdAt: new Date().toISOString(),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🏍️  Xtreme Powersports Stealth Scraper v2\n" + "=".repeat(44));

  const browser = await chromium.launch({
    headless: true,
    args: LAUNCH_ARGS,
    executablePath: undefined, // uses Playwright's bundled Chromium
  });

  const context = await browser.newContext({
    userAgent: randomUA(),
    viewport: VIEWPORT,
    locale: "en-US",
    timezoneId: "America/New_York",
    permissions: [],
    // Ignore HTTPS errors from some manufacturer sites
    ignoreHTTPSErrors: true,
  });

  // Block images/fonts/media to speed up navigation (we get URLs from DOM, not actual downloads)
  await context.route("**/*.{png,jpg,jpeg,webp,gif,svg,ico,woff,woff2,ttf,eot,mp4,mp3}", async (route) => {
    await route.abort();
  });

  const allVehicleRaw = [];
  const allPartsRaw = [];

  // ── Vehicles ────────────────────────────────────────────────────────────
  console.log("\n📦 Scraping vehicles...\n");
  for (const source of VEHICLE_SOURCES) {
    console.log(`\n[${source.brand}]`);
    const page = await stealthPage(context, "https://www.google.com");
    try {
      const raw = await scrapePage(page, source);
      allVehicleRaw.push(...raw.map(r => ({ ...r, brand: source.brand, category: source.category })));
    } catch (err) {
      console.warn(`  ✗ Error: ${err.message}`);
    } finally {
      await page.close();
      await delay(jitter(1500, 800)); // polite crawl delay
    }
  }

  // ── Parts ────────────────────────────────────────────────────────────────
  console.log("\n🔧 Scraping parts...\n");
  for (const source of PARTS_SOURCES) {
    console.log(`\n[${source.category} — ${source.brand}]`);
    const page = await stealthPage(context, "https://www.google.com");
    try {
      const raw = await scrapePage(page, source);
      allPartsRaw.push(...raw);
    } catch (err) {
      console.warn(`  ✗ Error: ${err.message}`);
    } finally {
      await page.close();
      await delay(jitter(1500, 800));
    }
  }

  await browser.close();

  // ── Build records ────────────────────────────────────────────────────────
  const vehicles = allVehicleRaw.filter(r => r.image && r.name).map(buildVehicle);
  const parts = allPartsRaw.filter(r => r.image && r.name).map(buildPart);

  console.log(`\n✅ ${vehicles.length} vehicle records`);
  console.log(`✅ ${parts.length} part records`);

  // ── Write output ─────────────────────────────────────────────────────────
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, "scraped-vehicles.json"),
    JSON.stringify(vehicles, null, 2),
    "utf8"
  );
  await fs.writeFile(
    path.join(DATA_DIR, "scraped-parts.json"),
    JSON.stringify(parts, null, 2),
    "utf8"
  );

  console.log("\n💾 Saved:");
  console.log(`   data/scraped-vehicles.json`);
  console.log(`   data/scraped-parts.json`);
  console.log("\n🎉 Done! Re-run anytime to refresh.\n");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
