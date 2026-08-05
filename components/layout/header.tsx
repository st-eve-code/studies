"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ShoppingCart,
  Heart,
  Search,
  Menu,
  X,
  ChevronDown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/context/wishlist-context";
import { ThemeToggle } from "@/components/web/theme-toggle";

// ── Nav data ──────────────────────────────────────────────────────────────────

const navLinks = [
  {
    label: "New Inventory",
    href: "/inventory?condition=new",
    children: [
      { label: "All New Vehicles", href: "/inventory?condition=new" },
      { label: "ATVs", href: "/inventory?condition=new&category=atv" },
      { label: "UTVs / Side-by-Sides", href: "/inventory?condition=new&category=utv" },
      { label: "Dirt Bikes", href: "/inventory?condition=new&category=dirt-bike" },
      { label: "Personal Watercraft", href: "/inventory?condition=new&category=personal-watercraft" },
      { label: "Snowmobiles", href: "/inventory?condition=new&category=snowmobile" },
      { label: "Street Bikes", href: "/inventory?condition=new&category=street-bike" },
    ],
  },
  {
    label: "Pre-Owned",
    href: "/inventory?condition=used",
    children: [
      { label: "All Pre-Owned", href: "/inventory?condition=used" },
      { label: "Certified Pre-Owned", href: "/inventory?condition=certified-pre-owned" },
      { label: "Used ATVs & UTVs", href: "/inventory?condition=used&category=atv" },
      { label: "Used Dirt Bikes", href: "/inventory?condition=used&category=dirt-bike" },
      { label: "Compare Vehicles", href: "/inventory/compare" },
    ],
  },
  {
    label: "Parts & Gear",
    href: "/parts",
    children: [
      { label: "Shop All Parts", href: "/parts" },
      { label: "OEM Parts", href: "/parts?type=oem" },
      { label: "Aftermarket", href: "/parts?type=aftermarket" },
      { label: "Performance", href: "/parts?type=performance" },
      { label: "Riding Gear & Helmets", href: "/parts?category=riding-gear" },
      { label: "Tires & Wheels", href: "/parts?category=tires-wheels" },
      { label: "OEM Microfiche", href: "/parts/microfiche" },
    ],
  },
  {
    label: "Service",
    href: "/services/service-request",
    children: [
      { label: "Schedule Service", href: "/services/service-request" },
      { label: "Trade-In Valuation", href: "/services/trade-in" },
      { label: "Financing", href: "/services/financing" },
      { label: "Current Promotions", href: "/company/promotions" },
    ],
  },
  {
    label: "About Us",
    href: "/company/about",
    children: [
      { label: "About Xtreme Powersports", href: "/company/about" },
      { label: "Contact Us", href: "/company/contact" },
      { label: "Promotions & Specials", href: "/company/promotions" },
      { label: "Privacy Policy", href: "/company/privacy" },
    ],
  },
];

type NavLink = (typeof navLinks)[number];

// ── Mobile accordion item ─────────────────────────────────────────────────────

function MobileNavItem({
  link,
  onClose,
}: {
  link: NavLink;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!link.children) {
    return (
      <Link
        href={link.href}
        className="block px-3 py-2.5 text-sm font-semibold rounded-md hover:bg-muted transition-colors"
        onClick={onClose}
      >
        {link.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-md hover:bg-muted transition-colors text-left"
      >
        {link.label}
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="ml-3 mt-0.5 mb-1 border-l-2 border-orange-500/30 pl-3 space-y-0.5">
          {link.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-2 py-2 text-sm text-foreground/70 hover:text-foreground rounded-md hover:bg-muted transition-colors"
              onClick={onClose}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

export function Header({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close delay — keeps the dropdown alive for 150ms after onMouseLeave
  // so the mouse can travel from the trigger button into the panel.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDropdown = useCallback((label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(label);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  // Clean up on unmount
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-shadow duration-200",
        "bg-background/95 backdrop-blur-sm border-b border-border",
        scrolled && "shadow-md",
        "print:hidden"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ───────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo.png"
              alt="Xtreme Powersports Inc."
              width={176}
              height={48}
              className="h-12 w-auto object-contain dark:brightness-110"
              priority
            />
          </Link>

          {/* ── Desktop Nav ────────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.children && openDropdown(link.label)}
                onMouseLeave={() => link.children && scheduleClose()}
              >
                {/* Trigger */}
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    "text-foreground/80 hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                  {link.children && (
                    <ChevronDown
                      className={cn(
                        "size-3.5 opacity-60 transition-transform duration-150",
                        activeDropdown === link.label && "rotate-180 opacity-100"
                      )}
                    />
                  )}
                </Link>

                {/* Dropdown — pt-2 is an invisible hover bridge that fills
                    the gap between the trigger and the visible panel so the
                    mouse never leaves the element while crossing it.         */}
                {link.children && activeDropdown === link.label && (
                  <div
                    className="absolute top-full left-0 pt-2 w-56 z-50"
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setActiveDropdown(null)}
                          className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* ── Right icons ────────────────────────────────────────── */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              aria-label="Search"
              onClick={onSearchOpen}
              className="p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Search className="size-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-4 text-[10px] font-bold bg-orange-600 text-white rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="relative p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              <ShoppingCart className="size-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-4 text-[10px] font-bold bg-orange-600 text-white rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            <ThemeToggle />

            {/* Mobile hamburger */}
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-0.5">
            {navLinks.map((link) => (
              <MobileNavItem
                key={link.href}
                link={link}
                onClose={() => setMobileOpen(false)}
              />
            ))}

            {/* Quick action row */}
            <div className="pt-4 pb-2 border-t border-border mt-3 flex gap-3">
              <Link
                href="/services/financing"
                className="flex-1 text-center py-2.5 text-sm font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Get Financing
              </Link>
              <Link
                href="/cart"
                className="flex-1 text-center py-2.5 text-sm font-semibold rounded-lg border border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Cart ({itemCount})
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
