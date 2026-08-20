/**
 * Xtreme Power Sports Group — Dealership Inventory Scraper
 * =========================================================
 * Scrapes https://www.extremepowersports.com/Inventory/All-Inventory-In-Stock
 *
 * The inventory is rendered client-side via Algolia. The site itself proxies the
 * Algolia query through /API/MVC/Dx1ShowroomAlgolia/Showroom/GetAlgoliaData, which
 * returns fully structured product hits (name, price, VIN, stock#, photos, specs,
 * features, etc.). We load the page in a real browser, paginate through every
 * result, and capture those hits as they come back.
 *
 * Usage:  node scripts/scrape-extreme.mjs
 * Output: data/scraped-vehicles.json  (merged into the app's /api/vehicles endpoint)
 */

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const OUT_FILE = path.join(DATA_DIR, "scraped-vehicles.json");
const LIST_URL = "https://www.extremepowersports.com/Inventory/All-Inventory-In-Stock";

// First page comes from the site's proxy; subsequent pages are queried directly
// against Algolia (retries may use the *.algolianet.com host).
const API_RE = /\/1\/indexes\/.*\/queries|Showroom\/GetAlgoliaData/;

const VIEWPORT = { width: 1920, height: 1080 };
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Field helpers ────────────────────────────────────────────────────────────

/** Strip HTML tags from a string, turning block-level breaks into separators. */
const stripHtml = (s) =>
  (s ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(?:p|div|li|h[1-6])>/gi, "; ")
    .replace(/<\/(?:p|div|li|h[1-6])(?=[^>])/gi, "; ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const clean = (s) => stripHtml(s);

/** "Utility Vehicles" / "ATVs" / … -> app VehicleCategory */
function mapCategory(category, productType, productName) {
  const c = (category ?? "").toLowerCase();
  const t = `${productType ?? ""} ${productName ?? ""}`.toLowerCase();

  if (/(utility vehicles|side.by.side|utv|rzr|maverick|defender|ranger|general|talon|pioneer|viking|teryx|krx)/.test(c + " " + t)) return "utv";
  if (/(atv|fourtrax|rancher|foreman|recon|sportsman|outlander|brute force|kodiak|grizzly|raptor|quads)/.test(c + " " + t)) return "atv";
  if (/(watercraft|pwc|personal|jet.ski|sea.doo|spark|gtx|rxp|rxt|gtx|wake|fish pro|pontoon|boat)/.test(c + " " + t)) return "personal-watercraft";
  if (/(snowmobile|sled|summit|mxz|freeride|backcountry|renegade|snow check)/.test(c + " " + t)) return "snowmobile";
  if (/(motocross|dirt|enduro|mx |exc|sx |sxf|two.stroke|ktm)/.test(t)) return "dirt-bike";
  if (/(motorcycle|street|scooter|sport|cruiser|touring|dual sport|ninja|gsxr|z |hayabusa|low rider|softail)/.test(c + " " + t)) return "street-bike";
  return "utv";
}

/** Site spec keys -> VehicleSpec keys (both lowercase, stripped of non-alnum) */
const SPEC_KEY_MAP = {
  engine: "engine",
  horsepower: "horsepower",
  displacement: "displacement",
  torque: "torque",
  transmission: "transmission",
  drivesystem: "drivetrain",
  finaldrive: "drivetrain",
  drivetrain: "drivetrain",
  fuelcapacity: "fuelCapacity",
  seatheight: "seatHeight",
  groundclearance: "groundClearance",
  weight: "weight",
  payloadcapacity: "payloadCapacity",
  towingcapacity: "towingCapacity",
  beddimensions: "bedDimensions",
  cargo: "bedDimensions",
  wheelbase: "wheelbase",
  length: "length",
  width: "width",
  height: "height",
  suspension: "suspension",
  frontsuspension: "suspension",
  rearsuspension: "suspension",
  brakes: "brakes",
  tires: "tires",
  wheels: "tires",
  fuelsystem: "fuelSystem",
  cooling: "cooling",
  color: "color",
  warranty: "warranty",
};

/**
 * Specs come back as one big "Key:value,Key2:value2,…" string where values can
 * themselves contain commas and <p> HTML. Split on ",<Key>:" boundaries.
 */
function parseSpecs(specsStr) {
  const out = {};
  if (!specsStr) return out;
  const text = specsStr.replace(/<p>/g, "").replace(/<\/p>/g, "; ").replace(/<br\s*\/?>/gi, "; ");
  const segments = text.split(/,(?=[A-Za-z][^,:\n]{0,60}:)/);
  for (const seg of segments) {
    const m = seg.match(/^\s*([^:]{1,80}?):\s*(.*)$/s);
    if (!m || !m[2].trim()) continue;
    const norm = m[1].trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const target = SPEC_KEY_MAP[norm];
    if (target && !out[target]) {
      out[target] = clean(m[2]).replace(/;+/g, "; ");
    }
  }
  return out;
}

/**
 * Features come back as "Group:TEXT,Group:TEXT,…" where group labels are
 * Title-Case phrases (e.g. "Unrivaled Versatility:", "Teryx KRX® 1000 eS:")
 * and the feature text itself uses ALL-CAPS lead-ins (e.g. "HAUL IT ALL: …"),
 * sometimes wrapped in <b> tags. Split on ",<group label>:" (a no-op for
 * <b>-wrapped ALL-CAPS lead-ins), strip HTML, then drop the leading Title-Case
 * group label so the ALL-CAPS lead-in is preserved.
 */
function parseFeatures(featuresStr) {
  if (!featuresStr) return [];
  const parts = featuresStr.split(/,(?=[A-Z][A-Za-z][^,:]{0,60}:)/);
  return parts
    .map((p) => clean(p.replace(/^[A-Z][a-z][^,:]{0,60}:\s*/, "")))
    .filter(Boolean);
}

function parseOdometer(hit) {
  if (!hit.HasOdometer || hit.Odometer == null) return {};
  const uom = (hit.OdometerUomCode || "").toUpperCase();
  if (uom === "MILES") return { mileage: hit.Odometer };
  if (uom === "HOURS") return { hours: hit.Odometer };
  return { mileage: hit.Odometer };
}

/** Build a full-resolution CDN URL. `_480px` variants can be dropped. */
function fullRes(url) {
  if (!url) return url;
  return url.replace(/([._-])480px(?=\.(?:jpe?g|png|webp))/i, (m) => (m.startsWith("_") ? "" : m));
}

// ── Record builder ───────────────────────────────────────────────────────────

let counter = 0;

function buildVehicle(hit, sourceUrl) {
  counter += 1;
  const id = `dealer-${hit.DealerInventoryId || hit.objectID}`;
  const name = clean(hit.ProductName);
  const year = hit.Year || new Date().getFullYear();
  const model = name.replace(new RegExp(`^${year}\\s*`), "").trim() || name;

  const price =
    typeof hit.Price === "number" && hit.Price > 0
      ? hit.Price
      : typeof hit.TotalPrice === "number" && hit.TotalPrice > 0
        ? hit.TotalPrice
        : typeof hit.Msrp === "number"
          ? hit.Msrp
          : 0;

  const images = (Array.isArray(hit.PhotoLists) ? hit.PhotoLists : [])
    .slice()
    .sort((a, b) => (a.Seq ?? 0) - (b.Seq ?? 0))
    .map((p) => fullRes(p.Url))
    .filter(Boolean);

  const odometer = parseOdometer(hit);

  return {
    id,
    vin: hit.Vin || undefined,
    stockNumber: clean(hit.StockNumber) || `XPS-DLR-${counter}`,
    condition: hit.IsCPO ? "certified-pre-owned" : hit.IsUsed ? "used" : "new",
    category: mapCategory(hit.FriendlyProductCategory?.OriginalValue ?? hit.ProductCategory, hit.FriendlyProductType?.OriginalValue ?? hit.ProductType, name),
    year,
    make: clean(hit.Manufacturer) || "Extreme Power Sports",
    model,
    trim: clean(hit.FriendlyProductType?.OriginalValue ?? hit.ProductType) || undefined,
    price,
    msrp: typeof hit.Msrp === "number" && hit.Msrp > 0 ? hit.Msrp : undefined,
    ...odometer,
    color: clean(hit.Color) || "See Dealer",
    images,
    specs: parseSpecs(hit.Specs),
    features: parseFeatures(hit.Features),
    description:
      clean(hit.TagLine) || clean(hit.LongDescription)
        ? [clean(hit.TagLine), clean(hit.LongDescription)].filter(Boolean).join(" ")
        : `${year} ${clean(hit.Manufacturer) || ""} ${name}. Contact us for full details and availability.`.trim(),
    status: "in-stock",
    isFeatured: !!hit.IsFeaturedOnSite,
    isNew: !hit.IsUsed,
    badge: hit.IsUsed ? "Used" : "New",
    dealerNotes: clean(hit.DealershipName) || undefined,
    sourceUrl: sourceUrl || hit.ShowroomUrl || LIST_URL,
    createdAt: hit.UpdatedDate ? new Date(hit.UpdatedDate).toISOString() : new Date().toISOString(),
  };
}

// ── Pagination driver ────────────────────────────────────────────────────────

async function clickNext(page) {
  const selectors = [
    ".ais-Pagination-item--nextPage a",
    ".ais-Pagination-item--nextPage button",
    ".showroom-result--next-page a",
    ".showroom-result--next-page button",
  ];
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) && (await loc.isVisible().catch(() => false))) {
      const cls = await loc.getAttribute("class").catch(() => "");
      if (!cls || !/disabled/.test(cls)) {
        await loc.click();
        return true;
      }
      return false;
    }
  }
  return false;
}

async function currentStats(page) {
  const t = await page.evaluate(() => {
    const el = document.querySelector(".showroom-result--stats, .ais-Stats-text");
    return el ? el.textContent.trim() : "";
  });
  const m = t.match(/of\s+([\d,]+)/i);
  return m ? parseInt(m[1].replace(/,/g, ""), 10) : null;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🏍️  Extreme Power Sports — Dealership Inventory Scraper\n" + "=".repeat(52));

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: VIEWPORT,
    locale: "en-US",
    timezoneId: "America/New_York",
    ignoreHTTPSErrors: true,
  });

  // Images are delivered by cdpcdn.dx1app.com (no auth). Blocking heavy assets
  // keeps pagination fast — photo URLs still come through in the API JSON.
  await context.route(/\.(?:png|jpe?g|webp|gif|svg|woff2?|ttf|mp4)(\?|$)/i, (route) => route.abort());
  const page = await context.newPage();

  const hitsByObjectId = new Map();
  const urlsByObjectId = new Map();

  page.on("response", async (res) => {
    if (!API_RE.test(res.url())) return;
    try {
      const j = await res.json();
      for (const r of j.results ?? []) {
        for (const hit of r.hits ?? []) {
          hitsByObjectId.set(hit.objectID || hit.DealerInventoryId, hit);
        }
      }
    } catch {}
  });

  console.log(`→ loading ${LIST_URL}`);
  await page.goto(LIST_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });

  // Wait for the first data response
  for (let i = 0; i < 30 && hitsByObjectId.size === 0; i++) await delay(500);
  if (hitsByObjectId.size === 0) throw new Error("No inventory data received — page may be blocked.");

  const total = (await currentStats(page)) ?? hitsByObjectId.size;
  console.log(`✓ page 1 loaded — ${hitsByObjectId.size} items so far (target ~${total})`);

  // Capture detail links rendered on the current page
  const grabLinks = async () => {
    await page.waitForSelector("article[data-itemid]", { timeout: 10_000 }).catch(() => {});
    await delay(800);
    const links = await page.evaluate(() => {
      const out = {};
      for (const el of document.querySelectorAll("article[data-itemid]")) {
        const a = el.querySelector("a[href]");
        if (a) out[el.getAttribute("data-itemid")] = a.href;
      }
      return out;
    });
    for (const [k, v] of Object.entries(links)) urlsByObjectId.set(k, v);
    const count = Object.keys(links).length;
    const host = links[Object.keys(links)[0]] ? new URL(links[Object.keys(links)[0]]).host : "none";
    if (count) console.log(`      [links] captured ${count} (${host})`);
  };

  await grabLinks();

  let pagesScraped = 1;
  while (hitsByObjectId.size < total) {
    const before = hitsByObjectId.size;
    const ok = await clickNext(page);
    if (!ok) break;

    // Wait for a new page of hits
    for (let i = 0; i < 40; i++) {
      if (hitsByObjectId.size > before) break;
      await delay(400);
    }
    await delay(600);
    await grabLinks();

    pagesScraped += 1;
    console.log(`✓ page ${pagesScraped} — ${hitsByObjectId.size} unique items`);

    if (hitsByObjectId.size === before) break;
  }

  await browser.close();

  const vehicles = Array.from(hitsByObjectId.values())
    .map((hit) => {
      const key = hit.objectID || hit.DealerInventoryId;
      return buildVehicle(hit, urlsByObjectId.get(key));
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const withImages = vehicles.filter((v) => v.images.length > 0).length;
  const totalPrice = vehicles.filter((v) => v.price > 0).length;

  console.log(`\n✅ ${vehicles.length} vehicles scraped`);
  console.log(`   ${withImages} with images`);
  console.log(`   ${totalPrice} with price`);

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(vehicles, null, 2), "utf8");

  console.log(`💾 Saved: ${OUT_FILE}`);
  console.log("\n🎉 Done!\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
