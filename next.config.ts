import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["unfineable-fredric-frowsily.ngrok-free.dev"],
  images: {
    // Next.js 16 hard limit: max 50 remotePatterns entries.
    // Using wildcard patterns where possible to cover multiple subdomains.
    remotePatterns: [
      // ── BRP group (Can-Am, Sea-Doo, Ski-Doo) ─────────────────────────────
      { protocol: "https", hostname: "**.brp.com" },
      { protocol: "https", hostname: "**.can-am.brp.com" },
      { protocol: "https", hostname: "**.sea-doo.com" },
      { protocol: "https", hostname: "**.ski-doo.com" },

      // ── Polaris ───────────────────────────────────────────────────────────
      { protocol: "https", hostname: "**.polaris.com" },

      // ── Yamaha ───────────────────────────────────────────────────────────
      { protocol: "https", hostname: "**.yamaha-motor.com" },
      { protocol: "https", hostname: "**.yamahamotorsports.com" },

      // ── Honda ─────────────────────────────────────────────────────────────
      { protocol: "https", hostname: "**.honda.com" },
      { protocol: "https", hostname: "powersports.honda.com" },

      // ── Kawasaki ──────────────────────────────────────────────────────────
      { protocol: "https", hostname: "**.kawasaki.com" },

      // ── KTM + Azure CDN (KTM press images) ───────────────────────────────
      { protocol: "https", hostname: "**.ktm.com" },
      { protocol: "https", hostname: "**.azureedge.net" },

      // ── Sea-Doo / Ski-Doo (BRP already covers, but explicit fallback) ──────
      { protocol: "https", hostname: "**.ski-doo.com" },

      // ── Arctic Cat / Textron ──────────────────────────────────────────────
      { protocol: "https", hostname: "**.arcticcat.com" },
      { protocol: "https", hostname: "**.textronoff-road.com" },

      // ── CFMOTO ────────────────────────────────────────────────────────────
      { protocol: "https", hostname: "**.cfmoto.com" },

      // ── Parts brands ──────────────────────────────────────────────────────
      { protocol: "https", hostname: "**.fmfracing.com" },
      { protocol: "https", hostname: "**.ridefox.com" },
      { protocol: "https", hostname: "**.troyleedesigns.com" },
      { protocol: "https", hostname: "**.itptires.com" },
      { protocol: "https", hostname: "**.mooseracing.com" },
      { protocol: "https", hostname: "**.warn.com" },
      { protocol: "https", hostname: "**.bajadesigns.com" },
      { protocol: "https", hostname: "**.alpinestars.com" },

      // ── Scene7 CDN (used by Polaris, Honda, others) ───────────────────────
      { protocol: "https", hostname: "**.scene7.com" },

      // ── Common dealer / e-commerce CDNs ──────────────────────────────────
      { protocol: "https", hostname: "**.shopify.com" },
      { protocol: "https", hostname: "**.dealer.com" },
      { protocol: "https", hostname: "**.dealereprocess.com" },

      // ── DX1 dealer inventory CDN (Extreme Power Sports scraped images) ────
      { protocol: "https", hostname: "**.dx1app.com" },

      // ── Wix store media (Xtreme Power Sports Parts product images) ────────
      { protocol: "https", hostname: "static.wixstatic.com" },

      // ── Amazon product images (Amazon-sourced parts catalog) ───────────────
      { protocol: "https", hostname: "**.media-amazon.com" },
    ],
  },
};

export default nextConfig;
