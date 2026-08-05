import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { YMMProvider } from "@/context/ymm-context";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";
import { SupportBubble } from "@/components/features/support-bubble";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Xtreme Powersports Inc. — Columbus, Ohio",
    template: "%s | Xtreme Powersports Inc.",
  },
  description:
    "Columbus Ohio's premier powersports dealer. ATVs, UTVs, dirt bikes, personal watercraft, parts & accessories. Financing available.",
  keywords: [
    "powersports",
    "ATV",
    "UTV",
    "dirt bike",
    "Can-Am",
    "Polaris",
    "Yamaha",
    "Honda",
    "Columbus Ohio",
    "parts",
    "accessories",
  ],
  openGraph: {
    title: "Xtreme Powersports Inc.",
    description: "Columbus Ohio's premier powersports dealer.",
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
      className={cn(geistSans.variable, geistMono.variable)}
    >
      <body className="antialiased flex flex-col min-h-screen">
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
