/**
 * Probe extremecolumbus.com parts stream.
 * Loads the page in a real browser and logs every network request/response
 * so we can discover the DX1 parts/microfiche endpoints and their JSON shape.
 *
 * Usage: node scripts/probe-extremecolumbus-parts.mjs
 */

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "data", "parts-probe-log.json");

const URLS = process.argv.slice(2);
const targets = URLS.length ? URLS : [
  "https://www.extremecolumbus.com/--xpartsstream",
  "https://www.extremecolumbus.com/",
];

const HEADED = process.env.HEADED === "1";

const VIEWPORT = { width: 1920, height: 1080 };
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const log = [];
const apiRe =
  /(parts|microfiche|fiche|diagram|catalog|stream|api|group|category)/i;

async function main() {
  const browser = await chromium.launch({
    headless: !HEADED,
    channel: HEADED ? "chrome" : undefined,
    args: ["--no-sandbox", ...(HEADED ? ["--disable-blink-features=AutomationControlled"] : [])],
  });
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: VIEWPORT,
    locale: "en-US",
    timezoneId: "America/New_York",
    ignoreHTTPSErrors: true,
  });
  if (HEADED) {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });
  }

  const page = await context.newPage();

  page.on("console", (msg) => {
    const text = msg.text();
    if (/error|failed|part|fiche|api/i.test(text)) {
      log.push({ type: "console", level: msg.type(), text: text.slice(0, 500) });
    }
  });

  page.on("request", (req) => {
    const url = req.url();
    if (!apiRe.test(url)) return;
    log.push({
      type: "request",
      method: req.method(),
      url,
      resourceType: req.resourceType(),
    });
  });

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
    if (ct.includes("json") || ct.includes("html")) {
      try {
        const body = await res.text();
        entry.bodyPreview = body.slice(0, 4000);
      } catch {}
    }
    log.push(entry);
  });

  for (const target of targets) {
    log.push({ type: "goto", url: target });
    try {
      await page.goto(target, { waitUntil: "domcontentloaded", timeout: 90_000 });
      await page.waitForTimeout(12_000);
      // give the Turnstile challenge a chance to auto-pass
      for (let i = 0; i < 5; i++) {
        const t = await page.title().catch(() => "");
        if (t !== "Just a moment...") break;
        await page.waitForTimeout(5000);
      }
      log.push({
        type: "page-info",
        url: page.url(),
        title: await page.title().catch(() => ""),
      });
      const links = await page.evaluate(() => {
        const out = [];
        for (const a of document.querySelectorAll("a[href]")) {
          const href = a.getAttribute("href") || "";
          if (/part|fiche|micro|diagram|group/i.test(href)) out.push(href);
        }
        return [...new Set(out)].slice(0, 100);
      });
      log.push({ type: "links", count: links.length, links });
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
