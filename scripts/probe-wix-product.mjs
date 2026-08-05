/**
 * Probe a single Wix product page to map its DOM structure.
 *
 * Usage: node scripts/probe-wix-product.mjs "<product-url>"
 */

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "data", "wix-product-probe.json");

const url = process.argv[2] || "https://www.xtremepowersportsparts.com/product-page/polaris-4-500-lb-winch-2889275";

const log = { api: [] };

async function main() {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    locale: "en-US",
    timezoneId: "America/New_York",
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  page.on("response", async (res) => {
    const ct = res.headers()["content-type"] || "";
    const url = res.url();
    if (!ct.includes("json") && !/product|catalog|store|item/i.test(url)) return;
    try {
      const body = await res.text();
      log.api.push({
        url,
        status: res.status(),
        contentType: ct,
        bodyPreview: body.slice(0, 12000),
      });
    } catch {}
  });

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForTimeout(8000);

  log.url = page.url();
  log.title = await page.title().catch(() => "");

  log.html = await page.content();

  await browser.close();
  await fs.writeFile(OUT, JSON.stringify(log, null, 2), "utf8");
  console.log(`Wrote ${log.html.length} html chars to ${OUT}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
