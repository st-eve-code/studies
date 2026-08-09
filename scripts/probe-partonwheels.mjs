import fs from "node:fs/promises";

const SITEMAP_IDX = "https://partonwheels.com/sitemap_index.xml";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

const urls = (xml) => [...xml.matchAll(/<loc><!\[CDATA\[([^\]]+)\]\]><\/loc>/gi)].map((m) => m[1]);

async function main() {
  // 1. sitemap index → product sitemaps → count
  const idx = await get(SITEMAP_IDX);
  const productSmaps = urls(idx).filter((u) => u.includes("product-sitemap"));
  console.log("product sitemaps:", productSmaps.length);

  let total = 0;
  const firstProducts = [];
  for (const sm of productSmaps.slice(0, 2)) {
    const xml = await get(sm);
    const productUrls = urls(xml);
    total += productUrls.length;
    for (const u of productUrls) if (firstProducts.length < 3) firstProducts.push(u);
    console.log(`${sm.split("/").pop()}: ${productUrls.length} products`);
    await delay(150);
  }
  console.log("count from first 2 sitemaps:", total);
  console.log("sample products:", firstProducts.join("\n  "));

  // 2. probe wp-json
  for (const p of ["/wp-json/wp/v2/product?per_page=2", "/wp-json"]) {
    try {
      const res = await fetch("https://partonwheels.com" + p, {
        headers: { "user-agent": "Mozilla/5.0" },
      });
      const text = await res.text();
      console.log(`\n--- wp-json ${p} -> ${res.status} (${text.length} bytes)`);
      console.log(text.slice(0, 600));
    } catch (e) {
      console.log(`\n--- wp-json ${p} failed: ${String(e).slice(0, 120)}`);
    }
    await delay(150);
  }

  // 3. probe one product page (JSON-LD + custom field rows)
  if (firstProducts.length) {
    const html = await get(firstProducts[0]);
    await fs.writeFile("C:/Users/Evil/AppData/Local/Temp/opencode/pow-product.html", html);
    console.log(`\n--- product page saved (${html.length} bytes)`);
    const ld = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
    console.log("json-ld blocks:", ld.length);
    for (const b of ld.slice(0, 2)) console.log(b.slice(0, 800));
    const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) =>
      m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    ).filter((t) => /make|model|year|applic|spec|brand|warrant|oem|mrp|part no/i.test(t)).slice(0, 15);
    console.log("\ncandidate table rows:", JSON.stringify(rows, null, 1));
  }
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
