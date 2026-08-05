/**
 * DX1 Microfiche Scraper — Xtreme Powersports Tampa
 * ===================================================
 * Crawls the accessible OEM microfiche at
 *   https://www.xtremepowersportstampa.com/Parts/Online-Parts-Fiche
 * for a few vehicle models and captures each section's diagram + parts table
 * into data/scraped-microfiche.json.
 *
 * Pages are plain server-rendered HTML (no JS/browser needed).
 *
 * Usage:  node scripts/scrape-dx1-fiche.mjs [--probe]
 *   --probe prints the browsable tree (makes → types → years → models) and exits.
 * Output: data/scraped-microfiche.json
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const OUT_FILE = path.join(DATA_DIR, "scraped-microfiche.json");

const BASE = "https://www.xtremepowersportstampa.com/Parts/Online-Parts-Fiche";
const probe = process.argv.includes("--probe");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

const SITE = "https://www.xtremepowersportstampa.com";

/** Extract fiche navigation links (text → absolute URL). */
function ficheLinks(html) {
  const out = [];
  for (const m of html.matchAll(
    /<a[^>]+class="fiche-hyperlink"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
  )) {
    const href = m[1];
    const text = clean(m[2].replace(/<[^>]+>/g, " "));
    if (!href) continue;
    const url = href.startsWith("http")
      ? href
      : href.startsWith("/")
        ? SITE + href
        : `${SITE}/Parts/Online-Parts-Fiche/${href}`;
    out.push({ text, url });
  }
  return out;
}

/** Depth of a URL below the fiche root: /honda/atvs/2026 → 3. */
function depth(url) {
  const segs = url.split("/").filter(Boolean);
  const i = segs.findIndex((s) => s.toLowerCase() === "online-parts-fiche");
  return segs.length - i - 1;
}

/** Link list filtered to exactly the given tree depth (excludes breadcrumbs). */
const atDepth = (links, d) => links.filter((l) => depth(l.url) === d);

/** Extract a balanced JSON array literal from `key: [...]` inside the page JS. */
function extractJsArray(html, key) {
  const startMarker = `${key}: [`;
  const i = html.indexOf(startMarker);
  if (i === -1) return null;
  let depth = 1; // the opening `[` of the array is already consumed
  let j = i + startMarker.length;
  let inStr = false;
  let esc = false;
  for (; j < html.length; j++) {
    const c = html[j];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) break;
    }
  }
  return JSON.parse("[" + html.slice(i + startMarker.length, j) + "]");
}

/** Extract a string/number property from the page JS options blob. */
function jsProp(html, key) {
  const re = new RegExp(`${key}:\\s*("([^"]*)"|([0-9.]+))`);
  const m = re.exec(html);
  return m ? (m[2] ?? m[3]) : "";
}

/**
 * Scrape one section page. The page embeds a JS `options` object containing a
 * full parts array, hotspot coordinates, and the diagram image URL.
 */
async function scrapeSection(url, label) {
  const html = await get(url);

  const partsRaw = extractJsArray(html, "parts") ?? [];
  const hotspots = extractJsArray(html, "hotspots") ?? [];
  const imageUrl = jsProp(html, "imageUrl");
  const imageWidth = Number(jsProp(html, "imageWidth")) || 0;
  const imageHeight = Number(jsProp(html, "imageHeight")) || 0;
  const sectionId = jsProp(html, "sectionId");

  const parts = partsRaw
    .filter((p) => p && p.partNumber)
    .map((p) => ({
      refNumber: String(p.referenceNumber ?? ""),
      sku: p.partNumberDisplay || p.partNumber,
      name: clean(p.partDescription ?? ""),
      qty: Number(p.quantityRequired) || 1,
      price: Number(p.price) || 0,
      availability: p.isDiscontinued
        ? "discontinued"
        : p.isPartExist === false
          ? "special-order"
          : "in-stock",
      ...(p.partDescriptionNote ? { note: clean(p.partDescriptionNote) } : {}),
      ...(p.superseededPart ? { replaces: p.superseededPart } : {}),
      ...(Number(p.msrp) ? { msrp: Number(p.msrp) } : {}),
    }));

  return {
    id: sectionId || url.split("/").pop(),
    name: label,
    diagramUrl: imageUrl ? imageUrl.replace(/^\/\//, "https://") : "",
    imageWidth,
    imageHeight,
    hotspots,
    parts,
  };
}

// ── Crawl helpers ────────────────────────────────────────────────────────────

async function getYears(typeUrl) {
  return atDepth(ficheLinks(await get(typeUrl)), 3);
}

async function getModels(yearUrl) {
  return atDepth(ficheLinks(await get(yearUrl)), 4);
}

async function getSections(modelUrl) {
  return atDepth(ficheLinks(await get(modelUrl)), 6);
}

const titleCase = (s) =>
  s
    .split(/[\s/-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/** Turn a type link like /honda/atvs into { make, vehicleType, url }. */
function parseTypeLink(link) {
  const segs = link.url.split("/").filter(Boolean);
  const tail = segs.findIndex((s) => s.toLowerCase() === "online-parts-fiche");
  const [make, vehicleType] = [segs[tail + 1], segs[tail + 2]];
  return {
    make: titleCase(make),
    vehicleType: titleCase(vehicleType),
    url: link.url,
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n📖 DX1 Microfiche Scraper\n${"=".repeat(30)}`);

  // The /category page lists make/type combos directly (e.g. honda/atvs).
  const root = await get(`${BASE}/category`);
  const types = ficheLinks(root)
    .filter((l) => /^https/.test(l.url) && /online-parts-fiche\/[a-z-]+\/[a-z-]+$/i.test(l.url))
    .map(parseTypeLink);

  if (probe) {
    console.log("Make/type tree:");
    for (const t of types) {
      const years = await getYears(t.url);
      console.log(`\n${t.make} — ${t.vehicleType} (${years.length} years)`);
      const top = [...years]
        .map((y) => ({ ...y, year: Number(y.text.match(/\d{4}/)?.[0]) || 0 }))
        .sort((a, b) => b.year - a.year)[0];
      if (top) {
        const models = await getModels(top.url);
        console.log(
          `    ${top.text}: ${models.length} models — ${models
            .slice(0, 8)
            .map((m) => m.text)
            .join(", ")}${models.length > 8 ? "…" : ""}`
        );
      }
      await delay(200);
    }
    return;
  }

  // ── Pick one recent model per make/type (keeps payload sane) ──────────────
  const picks = [];
  for (const t of types) {
    const years = await getYears(t.url);
    const latest = [...years]
      .map((y) => ({ ...y, year: Number(y.text.match(/\d{4}/)?.[0]) || 0 }))
      .sort((a, b) => b.year - a.year)[0];
    if (!latest || latest.year < 2020) continue;

    const models = await getModels(latest.url);
    const model = models[0];
    if (!model) continue;

    picks.push({ ...t, year: latest.year, model });
    await delay(200);
  }

  console.log(`\nScraping ${picks.length} models:\n`);
  const catalog = [];

  for (const pick of picks) {
    console.log(`  ${pick.make} ${pick.vehicleType} — ${pick.year} ${pick.model.text}`);
    const sections = await getSections(pick.model.url);
    const sectionData = [];
    let ok = 0;
    for (const s of sections) {
      try {
        const data = await scrapeSection(s.url, s.text);
        if (data.parts.length) ok++;
        sectionData.push(data);
      } catch (e) {
        console.log(`    ✗ ${s.text.slice(0, 40)} → ${String(e).slice(0, 100)}`);
        sectionData.push({ id: s.url.split("/").pop(), name: s.text, diagramUrl: "", parts: [] });
      }
      await delay(150);
    }
    console.log(`    → ${sections.length} sections, ${ok} with parts`);
    catalog.push({
      make: pick.make,
      vehicleType: pick.vehicleType,
      year: pick.year,
      model: pick.model.text,
      modelCode: pick.model.url.split("/").pop(),
      sections: sectionData,
    });
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(catalog, null, 2), "utf8");
  console.log(`\n💾 Saved: ${OUT_FILE} (${catalog.length} models)`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
