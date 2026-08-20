import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { YMMProvider } from "@/context/ymm-context";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";
import { SupportBubble } from "@/components/features/support-bubble";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.region}`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    `${siteConfig.region.split(",")[0]} Ohio's premier powersports dealer. ATVs, UTVs, dirt bikes, personal watercraft, parts & accessories. No-haggle pricing.`,
  keywords: [
    "powersports",
    "ATV",
    "UTV",
    "dirt bike",
    "Can-Am",
    "Polaris",
    "Yamaha",
    "Honda",
    `${siteConfig.region.split(",")[0]} Ohio`,
    "parts",
    "accessories",
  ],
  openGraph: {
    title: siteConfig.name,
    description: `${siteConfig.region.split(",")[0]} Ohio's premier powersports dealer.`,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(poppins.variable, geistMono.variable)}
    >
      <body className="antialiased flex flex-col min-h-screen">
        {/* CONTRACT: Dark racing, light shop.
            THESIS: Parts are the product. This is a parts-first powersports storefront that refuses the
            vehicle-dealer landing page: no inventory, no services, no microfiche in the path — every surface
            ends in a part, a brand, or a cart.
            OWN-WORLD: A racing-black identity band (signal-orange announcement bar, near-black nav, dark
            heroes on brand pages) over a clean white shop — dense light product cards with real imagery,
            prices, stock and fitment. One accent: racing orange. Sharp heavy type, uppercase tracked racing
            labels, generous white shop surfaces for comparing parts.
            STORY: A rider lands on a dark strip that reads "ready to ride"; they pick their brand or
            category, scan a clean Amazon-grade parts grid, and check out — dealer trust carried by the band.
            FIRST VIEWPORT: Dark full-bleed image hero, orange headline + two CTAs (Shop Parts / Shop by
            Brand), stat strip (parts in stock, brands, free shipping, no-haggle) below the fold line.
            FORM: User-pinned direction (dark racing + light shop, KTM x Amazon/eauto) — committed directly.
            FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
            verdict, and DESIGN.md */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <YMMProvider>
            <CartProvider>
              <WishlistProvider>
                {/* Top announcement strip */}
                <AnnouncementBar />

                {/* Sticky header with nav + search modal */}
                <SiteHeader />

                {/* Page content */}
                <main className="flex-1">
                  {children}
                </main>

                {/* Footer */}
                <Footer />

                {/* Floating customer support bubble — fixed position */}
                <SupportBubble />
              </WishlistProvider>
            </CartProvider>
          </YMMProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
