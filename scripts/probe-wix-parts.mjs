/**
 * Probe xtremepowersportsparts.com (Wix store) for its product data structure.
 * Wix stores expose products via _api/wix-ecommerce-catalog-webapp-serverless or
 * /_api/items/v1-stores. We log every store/API response to map the shape.
 *
 * Usage: node scripts/probe-wix-parts.mjs [url]
 */

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "data", "wix-parts-probe.json");

const URLS = process.argv.slice(2);
const targets = URLS.length ? URLS : ["https://www.xtremepowersportsparts.com/"];

const VIEWPORT = { width: 1920, height: 1080 };
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const log = [];
const apiRe = /\/_api\/|wix|stores|products|catalog|items\//i;

async function main() {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: VIEWPORT,
    locale: "en-US",
    timezoneId: "America/New_York",
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  page.on("response", async (res) => {
    const url = res.url();
    if (!apiRe.test(url)) return;
    const entry = {
      type: "response",
      status: res.status(),
      url,
      contentType: res.headers()["content-type"] || "",
    };
    const ct = entry.contentType;
    if (ct.includes("json")) {
      try {
        const body = await res.text();
        entry.bodyPreview = body.slice(0, 6000);
      } catch {}
    }
    log.push(entry);
  });

  for (const target of targets) {
    log.push({ type: "goto", url: target });
    try {
      await page.goto(target, { waitUntil: "domcontentloaded", timeout: 90_000 });
      await page.waitForTimeout(10_000);
      log.push({
        type: "page-info",
        url: page.url(),
        title: await page.title().catch(() => ""),
      });
      const data = await page.evaluate(() => ({
        hasScript: !!document.querySelector('script[data-name="wix-warmup-data"]'),
        productCountText: document.body.innerText.match(/[\d,]+ products?/i)?.[0] || "",
        links: [...new Set(
          Array.from(document.querySelectorAll("a[href]"))
            .map((a) => a.getAttribute("href") || "")
            .filter((h) => /product|categ|shop|part/i.test(h))
        )].slice(0, 60),
      }));
      log.push({ type: "dom-info", ...data });
    } catch (err) {
      log.push({ type: "goto-error", url: target, error: String(err).slice(0, 500) });
    }
  }

  await browser.close();

  await fs.writeFile(OUT, JSON.stringify(log, null, 2), "utf8");
  console.log(`Wrote ${log.length} log entries to ${OUT}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
