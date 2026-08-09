/**
 * Part On Wheels Scraper (partonwheels.com)
 * ===========================================
 * Scrapes the full WooCommerce product catalog of partonwheels.com into
 * data/pow-raw-parts.json.  The store is a WordPress/WooCommerce site whose
 * product pages embed schema.org Product JSON-LD carrying sku, price,
 * availability, rating and fitment ("Applicability Base Model / Applicability
 * Model / Brand").
 *
 * Product URLs + images are gathered from the site's 26 product sitemaps
 * (much cheaper than crawling category pages), then each product page is
 * fetched to pull its JSON-LD.
 *
 * Usage:
 *   node scripts/scrape-partonwheels.mjs [--max <n>] [--urls-file <path>]
 *   --max <n>        stop after scraping n products (sanity runs)
 *   --urls-file      use a previously saved data/pow-urls.json instead of
 *                    re-fetching the sitemaps
 *
 * Resumable: already-scraped URLs are skipped on re-run, and progress is
 * saved incrementally.  Prices are stored in their native currency (INR).
 * Output: data/pow-raw-parts.json
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const URLS_FILE = path.join(DATA_DIR, "pow-urls.json");
const OUT_FILE = path.join(DATA_DIR, "pow-raw-parts.json");

const SITEMAP_INDEX = "https://partonwheels.com/sitemap_index.xml";
const BASE = "https://partonwheels.com";
const CONCURRENCY = 4;
const RETRIES = 3;

const args = process.argv.slice(2);
const maxIdx = args.indexOf("--max");
const MAX = maxIdx !== -1 ? Number(args[maxIdx + 1]) : 0;
const urlsFileIdx = args.indexOf("--urls-file");
const URLS_FILE_OVERRIDE = urlsFileIdx !== -1 ? args[urlsFileIdx + 1] : null;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
const stripTags = (s) => clean((s ?? "").replace(/<[^>]+>/g, " "));

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";

async function get(url) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

const xmlUrls = (xml) =>
  [...xml.matchAll(/<loc><!\[CDATA\[([^\]]+)\]\]><\/loc>/gi)].map((m) => m[1]);

// ── Phase 1: collect product URLs + images from sitemaps ──────────────────────

async function collectUrls() {
  console.log("Fetching sitemap index…");
  const idx = await get(SITEMAP_INDEX);
  const productSmaps = xmlUrls(idx).filter((u) => u.includes("product-sitemap"));
  console.log(`${productSmaps.length} product sitemaps`);

  const products = [];
  for (const sm of productSmaps) {
    try {
      const xml = await get(sm);
      for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
        const body = block[1];
        const loc = /<loc><!\[CDATA\[([^\]]+)\]\]><\/loc>/.exec(body)?.[1];
        if (!loc) continue;
        const images = [...body.matchAll(/<image:loc><!\[CDATA\[([^\]]+)\]\]><\/image:loc>/gi)]
          .map((m) => m[1])
          .filter((u) => /^https?:/.test(u));
        products.push({ url: loc, images });
      }
      console.log(`  ${sm.split("/").pop()}: ${products.length} total so far`);
    } catch (e) {
      console.log(`  ✗ ${sm} → ${String(e).slice(0, 100)}`);
    }
    await delay(150);
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(URLS_FILE, JSON.stringify(products, null, 1), "utf8");
  console.log(`💾 ${products.length} product URLs → ${URLS_FILE}`);
  return products;
}

// ── Product page parsing ───────────────────────────────────────────────────────

function findProductLd(html) {
  for (const block of html.matchAll(
    /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi
  )) {
    let parsed;
    try {
      parsed = JSON.parse(block[1]);
    } catch {
      continue;
    }
    const node =
      parsed?.["@type"] === "Product"
        ? parsed
        : parsed?.["@graph"]?.find?.((n) => n["@type"] === "Product");
    if (node?.name) return node;
  }
  return null;
}

const KNOWN_MAKES = new Set([
  "hero", "bajaj", "honda", "tvs", "yamaha", "royal enfield", "ktm",
  "suzuki", "mahindra", "mahindra mojo",
]);

// The storefront renders field separators as em dashes (U+2014).
const SEP = "[\\-–—:]";

function extractFitment(node, html) {
  const desc = node.description ?? "";
  const brand =
    new RegExp(`(?:Brand|BRAND)\\s*${SEP}*\\s*([^\\r\\n|]+)`, "i").exec(desc)?.[1]
      ?.replace(/^[^A-Za-z0-9]+/, "")
      .trim() || null;

  const baseModelLine = new RegExp(
    `Applicability Base Model\\s*${SEP}?\\s*([^\\r\\n]+)`,
    "i"
  ).exec(desc);
  const baseModels = baseModelLine
    ? baseModelLine[1]
        .split(/[/|]/)
        .map((s) => clean(s))
        .filter(Boolean)
    : [];

  const modelYearLine = new RegExp(
    `Applicability Model\\s*${SEP}?\\s*([^\\r\\n]+)`,
    "i"
  ).exec(desc);
  const modelYearsText = modelYearLine ? clean(modelYearLine[1]) : null;

  // Make | Model | Year tables (Royal Enfield style) rendered in HTML.
  const tableFitments = [];
  for (const t of html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)) {
    const headText = stripTags(t[1]).toLowerCase();
    if (!/make|model|year/.test(headText)) continue;
    for (const row of t[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
        (c) => clean(stripTags(c[1]))
      );
      if (cells.length < 3) continue;
      if (!KNOWN_MAKES.has(cells[0].toLowerCase())) continue;
      const yr = cells[2].toLowerCase();
      tableFitments.push({
        make: cells[0],
        model: cells[1],
        year: yr === "all model" || yr === "all" || yr === "all models" ? null : yr,
      });
    }
  }

  return { brand, baseModels, modelYearsText, tableFitments };
}

function extractBrandFromBreadcrumb(html) {
  for (const block of html.matchAll(
    /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi
  )) {
    let parsed;
    try {
      parsed = JSON.parse(block[1]);
    } catch {
      continue;
    }
    const nodes = Array.isArray(parsed) ? parsed : parsed["@graph"] ?? [];
    for (const n of nodes) {
      if (n?.["@type"] !== "BreadcrumbList" || !n.itemListElement) continue;
      for (const item of n.itemListElement) {
        if (item.name && /^\/brand\//.test(item.item ?? "")) {
          return clean(item.name).replace(/^[^A-Za-z0-9]+/, "").trim();
        }
      }
    }
  }
  return null;
}

function parseProductPage(html, entry) {
  const node = findProductLd(html);
  if (!node) return null;

  const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers ?? {};
  const price =
    Number(offers.price ?? offers.priceSpecification?.[0]?.price) || null;
  const currency = offers.priceCurrency ?? null;
  const availability = offers.availability?.includes("OutOfStock")
    ? "out-of-stock"
    : offers.availability?.includes("InStock")
      ? "in-stock"
      : "special-order";

  const rating = node.aggregateRating?.ratingValue
    ? Number(node.aggregateRating.ratingValue)
    : 0;
  const reviewCount = node.aggregateRating?.reviewCount
    ? Number(node.aggregateRating.reviewCount)
    : 0;

  const imageNode = node.image;
  const ldImage = Array.isArray(imageNode)
    ? imageNode[0]
    : typeof imageNode === "string"
      ? imageNode
      : imageNode?.url;

  const fitment = extractFitment(node, html);
  const breadcrumbBrand = extractBrandFromBreadcrumb(html);

  return {
    url: entry.url,
    name: clean(node.name),
    sku: node.sku ? String(node.sku) : null,
    price,
    currency,
    availability,
    rating,
    reviewCount,
    images: [...new Set([...(entry.images ?? []), ldImage].filter(Boolean))],
    brand: breadcrumbBrand ?? fitment.brand,
    baseModels: fitment.baseModels,
    modelYearsText: fitment.modelYearsText,
    tableFitments: fitment.tableFitments,
    description: clean(node.description ?? ""),
  };
}

// ── Phase 2: page-by-page scrape ───────────────────────────────────────────────

async function scrapePages(urls) {
  const raw = await fs.readFile(OUT_FILE, "utf8").catch(() => "[]");
  const existing = raw.trim() ? JSON.parse(raw) : [];
  const done = new Map(existing.filter((p) => !p.failed).map((p) => [p.url, p]));
  const failed = new Map(existing.filter((p) => p.failed).map((p) => [p.url, p]));
  const queue = urls.filter((u) => !done.has(u.url) && !failed.has(u.url));
  console.log(
    `\nScraping ${queue.length} product pages (${done.size} on disk, ${failed.size} to retry)…`
  );

  let next = 0;
  async function worker() {
    while (true) {
      if (MAX && done.size >= MAX) return;
      const idx = next++;
      if (idx >= queue.length) return;
      const entry = queue[idx];
      let record = null;
      let fetchErr = null;
      for (let attempt = 0; attempt <= RETRIES; attempt++) {
        try {
          record = parseProductPage(await get(entry.url), entry);
          break;
        } catch (e) {
          fetchErr = e;
          if (attempt < RETRIES) await delay(700 * (attempt + 1) + Math.random() * 400);
        }
      }
      if (record) {
        done.set(record.url, record);
      } else if (fetchErr) {
        // Transient failure (network / rate-limit) — keep for a later run.
        failed.set(entry.url, { url: entry.url, failed: true, reason: String(fetchErr).slice(0, 80) });
      } else {
        // Page fetched fine but carried no Product JSON-LD — permanent skip.
        done.set(entry.url, { url: entry.url, skipped: true });
      }
      if ((done.size + failed.size) % 100 === 0) {
        await save();
        console.log(
          `  … ${done.size} done, ${failed.size} failed / ${queue.length} queue`
        );
      }
      await delay(260 + Math.random() * 340);
    }
  }

  async function save() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      OUT_FILE,
      JSON.stringify([...done.values(), ...failed.values()], null, 1),
      "utf8"
    );
  }

  const workers = Array.from({ length: CONCURRENCY }, worker);
  await Promise.all(workers);
  await save();

  const real = [...done.values()].filter((p) => !p.skipped);
  console.log(
    `\n💾 Saved: ${OUT_FILE}\n   ${real.length} parts scraped, ${done.size - real.length} skipped (no JSON-LD)`
  );
}

async function main() {
  console.log(`\n🛒 Part On Wheels Scraper\n${"=".repeat(30)}`);
  const urls = URLS_FILE_OVERRIDE
    ? JSON.parse(await fs.readFile(URLS_FILE_OVERRIDE, "utf8"))
    : await collectUrls();

  if (MAX) {
    await scrapePages(urls.slice(0, MAX));
  } else {
    await scrapePages(urls);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
