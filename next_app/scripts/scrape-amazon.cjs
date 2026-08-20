/**
 * Amazon Parts Scraper
 * =====================
 * Scrapes Amazon search results for vehicle-brand parts queries and saves them
 * to data/amazon-parts.json. Each product gets its ASIN, title, price (USD),
 * image, rating, review count and a category guess.
 *
 * Usage:
 *   node scripts/scrape-amazon.cjs [--brands can-am,polaris] [--pages 1] [--max <n>]
 *
 * Resumable: completed queries are skipped on re-run. Incremental saves every
 * few queries. Output: data/amazon-parts.json
 */

const { chromium } = require("playwright-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("node:fs");
const path = require("node:path");

chromium.use(StealthPlugin());

const DATA_DIR = path.join(__dirname, "..", "data");
const OUT_FILE = path.join(DATA_DIR, "amazon-parts.json");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

// Brand -> search queries. Queries are specific so results are actually on-brand.
const BRAND_QUERIES = {
  "can-am": ["can am maverick parts", "can am defender parts", "can am outlander parts"],
  polaris: ["polaris rzr parts", "polaris ranger parts", "polaris sportsman parts"],
  yamaha: ["yamaha atv parts", "yamaha raptor parts", "yamaha side by side parts"],
  honda: ["honda atv parts", "honda pioneer parts", "honda talon parts"],
  kawasaki: ["kawasaki atv parts", "kawasaki side by side parts", "kawasaki brute force parts"],
  "sea-doo": ["sea doo parts", "sea doo jet ski parts", "sea doo spark parts"],
  "ski-doo": ["ski doo snowmobile parts", "ski doo parts"],
  ktm: ["ktm dirt bike parts", "ktm motorcycle parts"],
  suzuki: ["suzuki atv parts", "suzuki king quad parts"],
  cfmoto: ["cfmoto parts", "cfmoto zforce parts"],
  "arctic-cat": ["arctic cat atv parts", "arctic cat parts"],
};

const args = process.argv.slice(2);
const brandIdx = args.indexOf("--brands");
const brandArg = brandIdx !== -1 ? args[brandIdx + 1] : undefined;
const pagesIdx = args.indexOf("--pages");
const pagesArg = pagesIdx !== -1 ? args[pagesIdx + 1] : undefined;
const maxIdx = args.indexOf("--max");
const maxArg = maxIdx !== -1 ? args[maxIdx + 1] : undefined;
const brands = brandArg ? brandArg.split(",") : Object.keys(BRAND_QUERIES);
const PAGES = pagesArg ? Number(pagesArg) : 2;
const MAX_TOTAL = maxArg ? Number(maxArg) : 0;

const existing = fs.existsSync(OUT_FILE) ? JSON.parse(fs.readFileSync(OUT_FILE, "utf8")) : [];
const results = new Map(existing.map((r) => [r.asin, r]));
const doneQueries = new Set(existing.map((r) => r.doneQuery).filter(Boolean));

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Category inference from title ─────────────────────────────────────────────

const CATEGORY_RULES = [
  [/belt|clutch|chain|sprocket|axle|diff(?:erential)?/i, "drivetrain"],
  [/brake|rotor|caliper|master cylinder/i, "brakes"],
  [/air filter|airfilter|intake|airbox/i, "air-filter"],
  [/winch|tow strap|recovery|snatch/i, "winch-recovery"],
  [/led|light|headlight|taillight|pod/i, "lighting"],
  [/exhaust|muffler|silencer|slip[- ]on/i, "exhaust"],
  [/shock|suspension|spring|strut|a[- ]arm/i, "suspension"],
  [/tire|wheel|rim/i, "tires-wheels"],
  [/mirror|fender|plastic|panel|fairing|seat|cover|hood/i, "body-plastics"],
  [/starter|stator|regulator|battery|harness|ignition|switch/i, "electrical"],
  [/carb(?:uretor)?|fuel pump|injector|fuel filter|petcock/i, "fuel-system"],
  [/oil|filter(?!.*air)|lubricant|coolant|grease/i, "oem-replacement"],
  [/handlebar|grip|lever|throttle|hand guard/i, "handlebars-controls"],
  [/skid|guard|armor|protector/i, "protection"],
  [/helmet|glove|boot|jacket|goggle/i, "riding-gear"],
  [/rack|bag|storage|cargo|container/i, "storage-cargo"],
  [/winch|recovery|tow/i, "winch-recovery"],
  [/tune|programmer|ecu|power commander/i, "performance"],
  [/radio|comms|intercom|gps|speaker/i, "communication"],
];

function guessCategory(title) {
  for (const [re, cat] of CATEGORY_RULES) {
    if (re.test(title)) return cat;
  }
  return "accessories";
}

// ── Page parsing ──────────────────────────────────────────────────────────────

function parseSearchPage(page) {
  return page.evaluate(() => {
    const out = [];
    const seen = new Set();
    for (const card of document.querySelectorAll('div[data-component-type="s-search-result"]')) {
      const asin = card.getAttribute("data-asin");
      if (!asin || seen.has(asin)) continue;
      const sponsored = card.querySelector(".puis-sponsored-label-text, .s-sponsored-label-text");
      if (sponsored) continue;
      const titleEl = card.querySelector("h2 span");
      const title = titleEl?.textContent?.trim();
      if (!title) continue;
      const priceEl = card.querySelector(".a-price .a-offscreen");
      const imgEl = card.querySelector("img.s-image");
      const linkEl = card.querySelector("a.a-link-normal[href*='/dp/']");
      const ratingEl = card.querySelector("span.a-icon-alt");
      const reviewsEl = card.querySelector("span.a-size-base.s-underline-text");
      const rating = ratingEl ? Number(ratingEl.textContent?.match(/[\d.]+/)?.[0]) : 0;
      const reviewCount = reviewsEl
        ? Number(reviewsEl.textContent.replace(/,/g, "")) || 0
        : 0;
      seen.add(asin);
      out.push({
        asin,
        title,
        price: priceEl?.textContent?.replace(/[^\d.]/g, "") || null,
        image: imgEl?.getAttribute("src")?.split("_AC_")[0] + "_AC_SL1500_.jpg" ?? null,
        url: linkEl
          ? new URL(linkEl.href, location.href).href.split("?")[0]
          : null,
        rating,
        reviewCount,
      });
    }
    return out;
  });
}

async function scrapeQuery(browser, query, pages, results, doneQueries) {
  const key = `${query}|${pages}`;
  if (doneQueries.has(key)) return 0;
  let added = 0;
  for (let p = 1; p <= pages; p++) {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}&page=${p}`;
    let page;
    try {
      page = await browser.newPage();
      const context = page.context();
      await context.addCookies([
        { name: "i18n-prefs", value: "USD", domain: ".amazon.com", path: "/" },
        { name: "lc-main", value: "en_US", domain: ".amazon.com", path: "/" },
      ]);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForSelector('div[data-component-type="s-search-result"]', {
        timeout: 25000,
      });
      await page.waitForTimeout(1200 + Math.random() * 1800);

      const body = await page.content();
      if (/To discuss automated access|robot check|captcha/i.test(body)) {
        console.log(`    ⚠ captcha on page ${p} of "${query}" — skipping`);
        break;
      }

      const items = await parseSearchPage(page);
      for (const it of items) {
        const key2 = it.asin;
        if (results.has(key2)) continue;
        results.set(key2, { ...it, query, fitment: [] });
        added++;
      }
      console.log(`  ✓ "${query}" p${p}: +${items.length} (${results.size} total)`);
    } catch (e) {
      console.log(`  ✗ "${query}" p${p}: ${String(e).slice(0, 90)}`);
    } finally {
      if (page) await page.close().catch(() => {});
    }
    if (MAX_TOTAL && results.size >= MAX_TOTAL) break;
    await delay(2500 + Math.random() * 2500);
  }
  doneQueries.add(key);
  return added;
}

async function main() {
  console.log(`\n🛒 Amazon Parts Scraper\n${"=".repeat(30)}`);
  console.log(`brands: ${brands.join(", ")} | pages/query: ${PAGES} | max: ${MAX_TOTAL || "∞"}`);

  console.log(`resuming: ${results.size} parts on disk`);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
  });

  let total = 0;
  for (const brand of brands) {
    const queries = BRAND_QUERIES[brand];
    if (!queries) {
      console.log(`⚠ unknown brand "${brand}" — skipping`);
      continue;
    }
    console.log(`\n── ${brand} ──`);
    for (const q of queries) {
      const added = await scrapeQuery(browser, q, PAGES, results, doneQueries);
      total += added;
      if (MAX_TOTAL && results.size >= MAX_TOTAL) break;
    }
    if (MAX_TOTAL && results.size >= MAX_TOTAL) break;
    save();
  }

  await browser.close();
  save();

  const branded = [...results.values()].map((r) => ({ ...r, doneQuery: undefined }));
  console.log(`\n💾 ${branded.length} parts → ${OUT_FILE}`);
}

function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const entries = [...results.values()];
  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify(
      entries.map((r) => ({ ...r, doneQuery: `${r.query}|${PAGES}` })),
      null,
      1
    ),
    "utf8"
  );
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
