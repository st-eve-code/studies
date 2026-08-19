/**
 * Build Catalog Parts
 * ====================
 * Transforms the raw Wix store scrape (data/scraped-parts.json) into the app's
 * `Part` shape (types/part.ts) written to data/catalog-parts.json.
 *
 * Rules applied:
 *   - Real SKUs / part numbers + real prices are kept (reference data).
 *   - Descriptions are written fresh (original copy) — the store's marketing
 *     text is NOT copied.
 *   - Fitment ("Designed to fit" lists in the source descriptions) is parsed
 *     into YMMFitment entries where it is clean enough; otherwise universal.
 *   - Brands/categories are inferred from the product name + description.
 *
 * Usage:  node scripts/build-catalog-parts.mjs
 * Output: data/catalog-parts.json
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const IN_FILE = path.join(DATA_DIR, "scraped-parts.json");
const OUT_FILE = path.join(DATA_DIR, "catalog-parts.json");

const CREATED = "2026-08-01T00:00:00Z";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Strip the Wix transform path so we get the original full-res image. */
function fullRes(url) {
  if (!url) return url;
  return url.replace(/\/v1\/.*$/, "");
}

function stripTags(s) {
  return (s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const STOPWORDS = new Set(["for", "and", "of", "with", "the", "to", "a", "in", "on", "oem"]);
const ACRONYMS = new Set([
  "orv", "oem", "atv", "utv", "sxs", "hp", "ss", "led", "cvt", "hd", "eps", "xp", "ac", "pro", "ap",
]);

function titleCase(s) {
  return s
    .split(" ")
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (i > 0 && STOPWORDS.has(lower)) return lower;
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

/** Clean a scraped product title into a display name. */
function cleanName(name, sku) {
  let n = stripTags(name)
    .replace(/^Description:?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  // Drop a trailing "<brand>-<sku>" style suffix or bare sku
  n = n.replace(new RegExp(`[\\s-]+${sku}$`, "i"), "").trim();
  return titleCase(n);
}

// ── Brand / category inference ───────────────────────────────────────────────

function detectBrand(name, description) {
  const hay = `${name} ${description}`.toUpperCase();
  const map = [
    ["POLARIS", "Polaris"],
    ["HUSQVARNA", "Husqvarna"],
    ["GASGAS", "GasGas"],
    ["GAS GAS", "GasGas"],
    ["MAXIMA", "Maxima"],
    ["SLINGSHOT", "Slingshot"],
    ["HONDA", "Honda"],
    ["NGK", "NGK"],
  ];
  for (const [needle, label] of map) {
    if (hay.includes(needle)) return label;
  }
  return "Xtreme Power Sports";
}

function detectCategory(name, description) {
  const hay = `${name} ${description}`.toUpperCase();
  const rules = [
    [/DRIVE BELT|CVT BELT/, "drivetrain"],
    [/WINCH/, "winch-recovery"],
    [/SPARK PLUG/, "engine"],
    [/AIR FILTER|AIRBOX/, "air-filter"],
    [/MIRROR/, "body-plastics"],
    [/LED|LIGHTING|\bLIGHT\b|HEADLIGHT/, "lighting"],
    [/HARNESS|WIRING/, "electrical"],
    [/BATTERY/, "electrical"],
    [/EXHAUST|MUFFLER|SILENCER/, "exhaust"],
    [/BRAKE/, "brakes"],
    [/OIL KIT|SERVICE KIT|MAINTENANCE KIT/, "oem-replacement"],
    [/GASKET|PISTON|VALVE|CAM\b|CRANK|HEAD\b/, "engine"],
    [/OIL\b|COOLANT|FLUID|GREASE|LUBE|CLEANER|WAX|DETERGENT/, "oem-replacement"],
    [/KIT\b/, "oem-replacement"],
  ];
  for (const [re, cat] of rules) {
    if (re.test(hay)) return cat;
  }
  return "accessories";
}

// ── Fitment parsing ──────────────────────────────────────────────────────────

// Only 4-digit tokens that look like real vehicle model years count as years
// (1990–2030). Model numbers like "1000" or "4500" are therefore ignored.
const YEAR_RANGE = /(?:199[0-9]|20[0-3][0-9])(?:-(?:199[0-9]|20[0-3][0-9]))?/g;

/** Pull the "Designed to fit:" section out of the source description. */
function extractFitmentText(description) {
  const m = /(?:DESIGNED\s+TO\s+FIT|FITS MODELS|FITS):?([\s\S]*)/i.exec(description);
  if (!m) return "";
  return m[1].replace(/\./g, " ").replace(/\s+/g, " ").trim();
}

function expandYears(raw) {
  const [y1, y2] = raw.split("-");
  const years = [];
  if (y2) {
    for (let y = Number(y1); y <= Number(y2); y++) years.push(y);
  } else {
    years.push(Number(y1));
  }
  return years;
}

/** Clean model text: drop year ranges, leading category words, extra punctuation. */
function cleanModel(entryText) {
  return entryText
    .replace(YEAR_RANGE, " ")
    .replace(/\b(ATV|UTV|SXS|SIDE[-\s]BY[-\s]SIDE|ORV)\b/gi, " ")
    .replace(/[\s,;&·|*®™]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s-]+/, "")
    .replace(/^\d{1,4}\s*/, "")
    .trim();
}

/** Build YMMFitment entries, capped to keep the JSON bounded. */
function parseFitment(description, make) {
  const text = extractFitmentText(description);
  if (!text) return [];

  const matches = [...text.matchAll(YEAR_RANGE)];
  if (!matches.length) return [];

  // Entry boundaries: a year-range starts a new entry UNLESS it directly
  // follows a comma/space (a continuation of a multi-year group like
  // "2022-2024, 2020 Model").
  const boundaries = matches.filter(
    (m) => !/[\s,]/.test(text[m.index - 1] ?? "")
  );

  const out = [];
  const seen = new Set();
  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i].index;
    const end = boundaries[i + 1]?.index ?? text.length;
    const entryText = text.slice(start, end);

    // Gather every year-range inside this entry.
    const years = [
      ...new Set(
        [...entryText.matchAll(YEAR_RANGE)].flatMap((m) => expandYears(m[0]))
      ),
    ].sort((a, b) => a - b);
    if (!years.length) continue;

    const model = cleanModel(entryText);
    if (!model) continue;

    for (const year of years) {
      const key = `${year}|${model}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ year, make, model });
      if (out.length >= 40) return out;
    }
    if (out.length >= 40) return out;
  }
  return out;
}

// ── Original description copy ────────────────────────────────────────────────

function fitmentHighlight(fitment) {
  if (!fitment.length) return "";
  const models = [...new Set(fitment.map((f) => f.model))].slice(0, 6).join(", ");
  const extras =
    [...new Set(fitment.map((f) => f.model))].length > 6 ? " and more" : "";
  return `Covers fitment for ${models}${extras}.`;
}

function buildDescription({ category, brand, name, sku, fitment }) {
  const hl = fitmentHighlight(fitment);
  const common =
    `Genuine OEM part ${sku} for ${brand} powersports vehicles. ` +
    (hl ? `${hl} ` : "Verify fitment against your vehicle before ordering. ");

  switch (category) {
    case "drivetrain":
      return (
        common +
        "Factory-spec CVT/drive belt engineered to match the original driveline geometry and compound. Delivers consistent engagement, reduced belt dust, and predictable performance across the full power range."
      );
    case "winch-recovery":
      return (
        common +
        "Factory winch and recovery hardware rated for ATV/UTV loads, with weather-sealed motor and synthetic or steel cable options. Includes mounting hardware sized to the intended chassis."
      );
    case "oem-replacement":
      return (
        common +
        "Factory-formulated fluid, filter, or maintenance item. Meets the OEM specification for the machines it is listed for, providing correct protection, change intervals, and fill behavior without aftermarket guesswork."
      );
    case "engine":
      return (
        common +
        "Precision engine component manufactured to factory tolerances. Direct replacement for the original part, no modifications required, keeps emissions and performance in spec."
      );
    case "air-filter":
      return (
        common +
        "OEM-spec air filtration element with correct media and sealing surface. Restores clean airflow and dust protection for dusty trail or track use."
      );
    case "lighting":
      return (
        common +
        "Factory lighting component with matched mounting and connectors. Plug-and-play with the stock harness, giving the correct beam pattern and legal road/off-road output."
      );
    case "electrical":
      return (
        common +
        "Factory electrical component with OEM-spec connectors and ratings. Direct fit onto the stock wiring, no cutting or splicing required."
      );
    case "body-plastics":
      return (
        common +
        "Factory-finished body or trim piece with the correct mounting points and hardware spacing. Painted or color-matched to the OEM finish where applicable."
      );
    case "exhaust":
      return (
        common +
        "OEM exhaust component with correct pipe diameter, mounting flanges, and internal packing. Preserves factory sound and emissions performance."
      );
    case "brakes":
      return (
        common +
        "Factory brake component with the original friction compound and hardware specs. Designed to match the vehicle's braking system for consistent, dependable stopping."
      );
    default:
      return (
        common +
        "Factory accessory or replacement part from the Xtreme Power Sports catalog, packaged and shipped ready to install."
      );
  }
}

function buildShortDescription(category) {
  const map = {
    drivetrain: "Factory CVT/drive belt replacement",
    "winch-recovery": "OEM winch & recovery hardware",
    "oem-replacement": "Genuine OEM maintenance part",
    engine: "Factory engine component",
    "air-filter": "OEM-spec air filtration",
    lighting: "Factory lighting component",
    electrical: "Factory electrical component",
    "body-plastics": "Factory body & trim piece",
    exhaust: "OEM exhaust component",
    brakes: "Factory brake component",
    accessories: "Xtreme Power Sports accessory",
  };
  return map[category] ?? "Xtreme Power Sports part";
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const raw = JSON.parse(await fs.readFile(IN_FILE, "utf8"));
  const existing = JSON.parse(await fs.readFile(OUT_FILE, "utf8").catch(() => "[]"));
  // Preserve Amazon-sourced parts added by build-amazon-catalog.mjs.
  const amazonParts = existing.filter((p) => p.id.startsWith("amz-"));
  console.log(`\n🔩 Build Catalog Parts\n${"=".repeat(30)}`);
  console.log(`✓ ${raw.length} raw products loaded (${amazonParts.length} amazon parts preserved)`);

  // Two store products can share one OEM SKU (e.g. the same Honda oil-change
  // kit listed per-model). ids derive from the SKU, so keep them unique.
  const usedIds = new Set();

  const catalog = raw
    .map((p, i) => {
      const brand = detectBrand(p.name, p.description);
      const category = detectCategory(p.name, p.description);
      const sku = (p.sku ?? "").trim();

      const images = (p.images ?? [])
        .filter((u) => u.startsWith("http"))
        .filter((u) => !/\/v1\/[^/]+\/w_(?:4[0-4]),h_(?:4[0-4]),/.test(u)) // drop ~43px thumbs
        .map(fullRes);
      const uniq = [...new Set(images)];

      const fitment = parseFitment(p.description ?? "", brand);
      const type =
        brand === "Maxima" || brand === "NGK" ? "aftermarket" : "oem";
      const isFeatured =
        /winch/i.test(p.name) ||
        /pro series/i.test(p.name) ||
        (p.price ?? 0) > 400;

      const name = cleanName(p.name, sku);
      const desc = buildDescription({
        category,
        brand,
        name,
        sku,
        fitment,
      });

      const tags = Array.from(
        new Set([
          category,
          brand.toLowerCase(),
          ...name.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
        ])
      ).slice(0, 8);

      const baseId = `scraped-${sku || i}`;
      let id = baseId;
      let n = 2;
      while (usedIds.has(id)) id = `${baseId}-${n++}`;
      usedIds.add(id);

      return {
        id,
        sku,
        name,
        brand,
        category,
        type,
        price: Number(p.price) || 0,
        images: uniq.length ? uniq : [],
        description: desc,
        shortDescription: buildShortDescription(category),
        specs: { partNumbers: [sku].filter(Boolean) },
        fitment,
        availability: "in-stock",
        stockQty: 8,
        isFeatured,
        rating: 0,
        reviewCount: 0,
        tags,
        createdAt: CREATED,
      };
    })
    .filter((p) => p.sku);

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify([...catalog, ...amazonParts], null, 2), "utf8");

  const withFitment = catalog.filter((p) => p.fitment.length).length;
  const featured = catalog.filter((p) => p.isFeatured).length;
  const cats = Object.entries(
    catalog.reduce((acc, p) => ((acc[p.category] = (acc[p.category] ?? 0) + 1), acc), {})
  ).sort((a, b) => b[1] - a[1]);
  const brands = Object.entries(
    catalog.reduce((acc, p) => ((acc[p.brand] = (acc[p.brand] ?? 0) + 1), acc), {})
  ).sort((a, b) => b[1] - a[1]);

  console.log(`\n✅ ${catalog.length} parts written → ${OUT_FILE}`);
  console.log(`   • with fitment data: ${withFitment}`);
  console.log(`   • featured: ${featured}`);
  console.log(`   • categories: ${cats.map(([k, v]) => `${k}(${v})`).join(", ")}`);
  console.log(`   • brands: ${brands.map(([k, v]) => `${k}(${v})`).join(", ")}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
