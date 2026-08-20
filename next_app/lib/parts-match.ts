/**
 * Vehicle → Parts matching.
 *
 * Given a vehicle listing, find the parts that fit it from two sources:
 *   1. The curated parts catalog (data/catalog-parts.json) whose `fitment`
 *      entries carry year/make/model — matched by normalized token overlap.
 *   2. The OEM microfiche (data/scraped-microfiche.json) — matched through
 *      data/fiche-model-map.json keywords so factory model codes map to the
 *      friendly model names used on the dealer's listings.
 *
 * If no model-specific match exists we fall back to make-level parts so the
 * section is never empty for a make we stock.
 */

import type { Part, PartCategory, MicroficheModel } from "@/types/part";
import type { Vehicle } from "@/types/vehicle";

export interface VehiclePartsResult {
  parts: Part[];
  source: "model" | "make" | "none";
  ficheModelCount: number;
}

interface FicheMapEntry {
  modelCode: string;
  keywords: string[];
}

// ── Normalization ─────────────────────────────────────────────────────────────

// Trim words are equal-noise on both sides (trim levels, drivetrain tags).
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "for", "with", "edition", "model",
  "deluxe", "premium", "northstar", "automatic", "4x4", "2x4", "4wd", "sxs",
  "eps", "dct", "irs", "es", "ho", "md",
]);

export function tokenize(s: string): string[] {
  return (s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Sørensen–Dice similarity — good for partial model-name overlap. */
function dice(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const sb = new Set(b);
  let inter = 0;
  for (const t of a) if (sb.has(t)) inter++;
  return (2 * inter) / (a.length + b.length);
}

const MODEL_SCORE = 0.55;

// ── Catalog parts ─────────────────────────────────────────────────────────────

function scoreCatalogPart(vehicle: Vehicle, part: Part): number {
  const vt = tokenize(vehicle.model);
  let best = 0;
  for (const f of part.fitment) {
    if (f.make.toLowerCase() !== vehicle.make.toLowerCase()) continue;
    let s = dice(vt, tokenize(f.model));
    if (f.year === vehicle.year) s += 0.1;
    if (s > best) best = s;
  }
  return best;
}

/** Best catalog parts for the vehicle, falling back to make-level parts. */
function matchCatalogParts(
  vehicle: Vehicle,
  allParts: Part[]
): { parts: Part[]; source: "model" | "make" } {
  const scored = allParts
    .filter((p) => p.fitment.length)
    .map((p) => ({ p, score: scoreCatalogPart(vehicle, p) }))
    .filter((x) => x.score > 0);

  const modelParts = scored
    .filter((x) => x.score >= MODEL_SCORE)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);

  if (modelParts.length) return { parts: modelParts, source: "model" };

  // Make fallback — everything cataloged for the vehicle's make.
  const makeParts = allParts.filter((p) =>
    p.fitment.some((f) => f.make.toLowerCase() === vehicle.make.toLowerCase())
  );
  return { parts: makeParts, source: "make" };
}

// ── Microfiche parts ──────────────────────────────────────────────────────────

function categoryFromSection(name: string): PartCategory {
  const n = name.toUpperCase();
  if (n.includes("BRAKE")) return "brakes";
  if (n.includes("ENGINE") || n.includes("CRANK") || n.includes("PISTON") ||
      n.includes("CYLINDER") || n.includes("VALVE") || n.includes("CAMSHAFT") ||
      n.includes("CRANKSHAFT") || n.includes("OIL PUMP") || n.includes("STARTER") ||
      n.includes("GENERATOR") || n.includes("GASKET") || n.includes("CLUTCH")) return "engine";
  if (n.includes("LIGHT") || n.includes("HEADLIGHT") || n.includes("TAILLIGHT")) return "lighting";
  if (n.includes("HARNESS") || n.includes("BATTERY") || n.includes("REGULATOR") ||
      n.includes("STATOR") || n.includes("WIRE")) return "electrical";
  if (n.includes("WHEEL") || n.includes("TIRE") || n.includes("RIM")) return "tires-wheels";
  if (n.includes("FENDER") || n.includes("PANEL") || n.includes("COVER") ||
      n.includes("SEAT") || n.includes("FRAME")) return "body-plastics";
  if (n.includes("EXHAUST") || n.includes("MUFFLER")) return "exhaust";
  if (n.includes("AIR CLEANER") || n.includes("AIR FILTER") || n.includes("AIRBOX")) return "air-filter";
  if (n.includes("FUEL") || n.includes("CARB") || n.includes("INJECTOR")) return "fuel-system";
  if (n.includes("TRANSMISSION") || n.includes("GEAR") || n.includes("CHAIN") ||
      n.includes("BELT") || n.includes("AXLE") || n.includes("FINAL") || n.includes("DRIVE")) return "drivetrain";
  if (n.includes("HANDLE") || n.includes("LEVER") || n.includes("CABLE") ||
      n.includes("THROTTLE") || n.includes("GRIP") || n.includes("BAR")) return "handlebars-controls";
  if (n.includes("SHOCK") || n.includes("SUSPENSION") || n.includes("CUSHION") ||
      n.includes("ARM") || n.includes("KNUCKLE") || n.includes("TIE ROD")) return "suspension";
  return "oem-replacement";
}

function sectionShort(name: string): string {
  const short = name.split(" - ")[0].trim();
  return short
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}

function ficheToPart(
  fiche: MicroficheModel,
  sectionName: string,
  mf: (typeof fiche.sections)[number]["parts"][number]
): Part {
  const sku = mf.sku || `${fiche.modelCode}-${mf.refNumber}`;
  const category = categoryFromSection(sectionName);
  return {
    id: `fiche-${fiche.modelCode}-${sku}`,
    sku,
    name: `${sectionShort(sectionName)}: ${mf.name}`,
    brand: fiche.make,
    category,
    type: "oem",
    price: Number(mf.price) || 0,
    images: [],
    description: `Genuine OEM part from the ${fiche.year} ${fiche.make} ${fiche.model} parts microfiche.`,
    shortDescription: `OEM part · ${sectionShort(sectionName)}`,
    specs: { partNumbers: [sku].filter(Boolean) },
    fitment: [{ year: fiche.year, make: fiche.make, model: fiche.model }],
    availability: mf.availability ?? "in-stock",
    stockQty: 5,
    isFeatured: false,
    rating: 0,
    reviewCount: 0,
    tags: [category, fiche.make.toLowerCase(), "oem"],
    createdAt: "2026-08-01T00:00:00Z",
  };
}

function matchMicrofiche(
  vehicle: Vehicle,
  ficheModels: MicroficheModel[],
  ficheMap: FicheMapEntry[]
): { parts: Part[]; modelCount: number } {
  const vt = tokenize(vehicle.model);
  const vm = vehicle.make.toLowerCase();

  const matched = ficheModels.filter((m) => {
    if (m.make.toLowerCase() !== vm) return false;
    const entry = ficheMap.find((e) => e.modelCode === m.modelCode);
    if (!entry) return false;
    return entry.keywords.every((k) => vt.includes(k));
  });

  const parts: Part[] = [];
  for (const fiche of matched) {
    for (const section of fiche.sections) {
      for (const mf of section.parts) {
        if (!mf.price || mf.availability === "discontinued") continue;
        parts.push(ficheToPart(fiche, section.name, mf));
      }
    }
  }
  return { parts, modelCount: matched.length };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function matchPartsForVehicle(
  vehicle: Vehicle,
  allParts: Part[],
  ficheModels: MicroficheModel[],
  ficheMap: FicheMapEntry[]
): Promise<VehiclePartsResult> {
  const catalog = matchCatalogParts(vehicle, allParts);
  const fiche = matchMicrofiche(vehicle, ficheModels, ficheMap);

  const seen = new Set<string>();
  const merged: Part[] = [];
  for (const p of [...catalog.parts, ...fiche.parts]) {
    const key = p.sku.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(p);
  }

  const source: VehiclePartsResult["source"] =
    catalog.source === "model" || fiche.modelCount > 0
      ? "model"
      : merged.length > 0
        ? "make"
        : "none";

  return { parts: merged, source, ficheModelCount: fiche.modelCount };
}
