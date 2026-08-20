/**
 * Build Amazon Parts Catalog
 * ===========================
 * Converts data/amazon-parts.json (raw search scrape) into app `Part` records
 * and merges them into data/catalog-parts.json alongside the scraped Wix parts.
 *
 * Per-brand keyword filters drop off-brand junk (e.g. Ford "Ranger" parts that
 * leak into "polaris ranger parts" results).  Prices are sanity-checked.
 *
 * Usage:  node scripts/build-amazon-catalog.mjs
 * Output: data/catalog-parts.json (merged)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const AMZ_IN = path.join(DATA_DIR, "amazon-parts.json");
const OUT_FILE = path.join(DATA_DIR, "catalog-parts.json");

const CREATED = "2026-08-09T00:00:00Z";

// Brand slug -> { label, keywords[] } used to keep results on-brand.
const BRANDS = {
  "can-am": { label: "Can-Am", keywords: ["can-am", "can am", "maverick", "defender", "outlander", "renagade", "ds 450", "atv"] },
  polaris: { label: "Polaris", keywords: ["polaris", "rzr", "ranger", "sportsman", "general", "scrambler", "ace", "atv", "utv", "side by side", "side-by-side"] },
  yamaha: { label: "Yamaha", keywords: ["yamaha", "raptor", "grizzly", "kodiak", "wolverine", "rhino", "viking", "warrior", "banshee"] },
  honda: { label: "Honda", keywords: ["honda", "pioneer", "rancher", "talon", "foreman", "trx", "rubicon", "fourtrax", "recon", "atv", "utv"] },
  kawasaki: { label: "Kawasaki", keywords: ["kawasaki", "brute force", "terr yx", "teryx", "mule", "klx", "kx", "bayou", "lakota", "atv", "utv"] },
  "sea-doo": { label: "Sea-Doo", keywords: ["sea-doo", "sea doo", "gtx", "gti", "spark", "wake", "fishpro", "jet ski", "pwc", "watercraft"] },
  "ski-doo": { label: "Ski-Doo", keywords: ["ski-doo", "ski doo", "snowmobile", "mx z", "mxz", "summit", "gsx", "expedition", "ren egade", "renegade"] },
  ktm: { label: "KTM", keywords: ["ktm", "sx", "exc", "duke", "adventure", "enduro", "dirt bike", "motorcycle"] },
  suzuki: { label: "Suzuki", keywords: ["suzuki", "king quad", "lt-z", "ltz", "quadrunner", "vinson", "eiger", "rm-z", "rmz", "atv", "dirt bike"] },
  cfmoto: { label: "CFMOTO", keywords: ["cfmoto", "cf-moto", "cforce", "c-force", "zforce", "z-force", "ufo"] },
  "arctic-cat": { label: "Arctic Cat", keywords: ["arctic cat", "arctic-cat", "wildcat", "thundercat", "alterra", "trail", "snowmobile", "atv", "utv"] },
};

// ── Category inference ────────────────────────────────────────────────────────

const CATEGORY_RULES = [
  [/belt|clutch|chain|sprocket|axle|diff(?:erential)?/i, "drivetrain"],
  [/brake|rotor|caliper|master cylinder/i, "brakes"],
  [/air filter|airfilter|intake|airbox/i, "air-filter"],
  [/winch|tow strap|recovery|snatch/i, "winch-recovery"],
  [/led|light|headlight|taillight|light bar|pod/i, "lighting"],
  [/exhaust|muffler|silencer|slip[- ]on/i, "exhaust"],
  [/shock|suspension|spring|strut|a[- ]arm|sway bar/i, "suspension"],
  [/tire|wheel|rim/i, "tires-wheels"],
  [/mirror|fender|plastic|panel|fairing|seat|cover|hood|windshield/i, "body-plastics"],
  [/starter|stator|regulator|battery|harness|ignition|switch|rectifier/i, "electrical"],
  [/carb(?:uretor)?|fuel pump|injector|fuel filter|petcock/i, "fuel-system"],
  [/oil|fluid|lubricant|coolant|grease|filter kit/i, "oem-replacement"],
  [/handlebar|grip|lever|throttle|hand guard|heated/i, "handlebars-controls"],
  [/skid|guard|armor|protector|bumper/i, "protection"],
  [/helmet|glove|boot|jacket|goggle|apparel/i, "riding-gear"],
  [/rack|bag|storage|cargo|container|box/i, "storage-cargo"],
  [/tune|programmer|ecu|power commander|flash/i, "performance"],
  [/radio|comms|intercom|gps|speaker|bluetooth/i, "communication"],
];

function guessCategory(title) {
  for (const [re, cat] of CATEGORY_RULES) {
    if (re.test(title)) return cat;
  }
  return "accessories";
}

// ── Title cleanup ─────────────────────────────────────────────────────────────

/** Strip seller-meta and brand-stacking prefixes but keep the fitment text. */
function cleanTitle(title) {
  let t = title
    .replace(/\s*\(TM\)|\s*®|\s*™/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return t;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const raw = JSON.parse(await fs.readFile(AMZ_IN, "utf8"));
  const existing = JSON.parse(await fs.readFile(OUT_FILE, "utf8"));
  console.log(`\n🛒 Build Amazon Catalog\n${"=".repeat(30)}`);
  console.log(`✓ ${raw.length} raw amazon products, ${existing.length} existing catalog parts`);

  // Keep existing non-Amazon parts untouched.
  const wixParts = existing.filter((p) => !p.id.startsWith("amz-"));
  const oldAmzIds = new Set(existing.filter((p) => p.id.startsWith("amz-")).map((p) => p.id));

  const amz = [];
  let dropped = 0;
  const seen = new Set();

  for (const r of raw) {
    const brandKey = brandOf(r.query);
    const meta2 = BRANDS[brandKey];
    if (!meta2) {
      dropped++;
      continue;
    }
    const { label } = meta2;

    const title = cleanTitle(r.title ?? "");
    if (!title) {
      dropped++;
      continue;
    }
    // Keep results that mention the brand or its model families.
    const hay = title.toLowerCase();
    if (!meta2.keywords.some((k) => hay.includes(k))) {
      dropped++;
      continue;
    }

    const price = Number(r.price);
    if (!price || price < 2 || price > 3000) {
      dropped++;
      continue;
    }
    if (!r.image || !r.image.startsWith("https://")) {
      dropped++;
      continue;
    }

    const key = title.toLowerCase();
    if (seen.has(key)) {
      dropped++;
      continue;
    }
    seen.add(key);

    const category = guessCategory(title);
    const tags = Array.from(
      new Set([
        category,
        label.toLowerCase().replace(/\s+/g, "-"),
        "amazon",
        ...title.toLowerCase().split(/\s+/).filter((w) => w.length > 4),
      ])
    ).slice(0, 10);

    amz.push({
      id: `amz-${r.asin}`,
      sku: r.asin,
      name: title,
      brand: label,
      category,
      type: "aftermarket",
      price,
      images: [r.image],
      description: `${title}.  Aftermarket part matched to ${label} vehicles, sourced from Amazon.`,
      shortDescription: `Amazon part for ${label} · ${category.replace(/-/g, " ")}`,
      specs: { partNumbers: [r.asin] },
      fitment: [{ year: 0, make: label, model: "" }],
      availability: "in-stock",
      stockQty: 8,
      isFeatured: false,
      rating: r.rating || 0,
      reviewCount: r.reviewCount || 0,
      tags,
      relatedSkus: undefined,
      createdAt: CREATED,
    });
  }

  // Mark a handful of top-rated parts as featured so the homepage has content.
  const sorted = [...amz].sort(
    (a, b) => b.reviewCount * (b.rating || 0) - a.reviewCount * (a.rating || 0)
  );
  for (const p of sorted.slice(0, 16)) p.isFeatured = true;

  const merged = [...wixParts, ...amz];
  // Unique ids (defensive) — suffix collisions.
  const used = new Set();
  for (const p of merged) {
    const base = p.id;
    let id = base;
    let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    p.id = id;
  }

  await fs.writeFile(OUT_FILE, JSON.stringify(merged, null, 2), "utf8");

  const perBrand = {};
  for (const p of amz) {
    const make = p.fitment[0]?.make ?? "?";
    perBrand[make] = (perBrand[make] ?? 0) + 1;
  }

  console.log(`\n✅ catalog-parts.json: ${merged.length} parts total`);
  console.log(`   • Wix parts kept: ${wixParts.length}`);
  console.log(`   • Amazon parts added: ${amz.length} (dropped ${dropped} off-brand/junk)`);
  console.log(`   • per brand: ${Object.entries(perBrand).map(([k, v]) => `${k}(${v})`).join(", ")}`);
}

function brandOf(query) {
  const norm = (s) => (s ?? "").toLowerCase().replace(/[\s-]/g, "");
  const q = norm(query);
  for (const key of Object.keys(BRANDS)) {
    if (q.startsWith(norm(key)) || q.startsWith(norm(BRANDS[key].label))) return key;
  }
  return "";
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
