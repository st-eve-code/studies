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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import logoImg from "@/components/logo/logo.jpeg";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/context/wishlist-context";
import { ThemeToggle } from "@/components/web/theme-toggle";
import { brands } from "@/data/brands";

// ── Nav data ──────────────────────────────────────────────────────────────────

const navLinks = [
  {
    label: "Shop by Brand",
    href: "/parts",
    brands: true,
  },
  {
    label: "Parts & Gear",
    href: "/parts",
    children: [
      { label: "Shop All Parts", href: "/parts" },
      { label: "Brakes & Clutches", href: "/parts?category=brakes" },
      { label: "Air & Intake", href: "/parts?category=air-filter" },
      { label: "Drivetrain & Belts", href: "/parts?category=drivetrain" },
      { label: "Lighting", href: "/parts?category=lighting" },
      { label: "Tires & Wheels", href: "/parts?category=tires-wheels" },
      { label: "Riding Gear & Helmets", href: "/parts?category=riding-gear" },
      { label: "Performance", href: "/parts?type=performance" },
    ],
  },
  {
    label: "Promotions",
    href: "/company/promotions",
  },
  {
    label: "Contact Us",
    href: "/company/contact",
  },
];

type NavLink = (typeof navLinks)[number];

// ── Brand rows (shared by desktop dropdown + mobile menu) ─────────────────────

function BrandRows({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {brands.map((b) => (
        <Link
          key={b.id}
          href={`/brands/${b.id}`}
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
        >
          {b.mark ? (
            <Image
              src={b.mark}
              alt={b.label}
              width={44}
              height={24}
              className={cn(
                "h-5 w-11 object-contain",
                b.darkInvert && "dark:brightness-0 dark:invert"
              )}
            />
          ) : (
            <span className="w-11 text-right font-semibold text-xs text-foreground/50">
              {b.label.slice(0, 3).toUpperCase()}
            </span>
          )}
          <span className="font-medium">{b.label}</span>
        </Link>
      ))}
    </div>
  );
}

// ── Mobile accordion item ─────────────────────────────────────────────────────

function MobileNavItem({
  link,
  onClose,
}: {
  link: NavLink;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!link.children && !link.brands) {
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

  if (link.brands) {
    return (
      <div className="px-3 py-2.5">
        <Link
          href={link.href}
          className="block text-sm font-semibold mb-2 hover:text-orange-600 transition-colors"
          onClick={onClose}
        >
          Shop by Brand
        </Link>
        <BrandRows onNavigate={onClose} />
      </div>
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
      {open && link.children && (
        <div className="ml-3 mt-0.5 mb-1 border-l-2 border-orange-500/30 pl-3 space-y-0.5">
          {link.children.map((child) => (
            <Link
              key={`${child.href}:${child.label}`}
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
        "bg-zinc-950 text-white border-b border-white/10",
        scrolled && "shadow-lg shadow-black/30",
        "print:hidden"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ───────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src={logoImg}
              alt={siteConfig.name}
              width={1320}
              height={1000}
              className="h-16 w-auto object-contain mix-blend-screen"
              priority
            />
          </Link>

          {/* ── Desktop Nav ────────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <div
                key={`${link.href}:${link.label}`}
                className="relative"
                onMouseEnter={() => (link.children || link.brands) && openDropdown(link.label)}
                onMouseLeave={() => (link.children || link.brands) && scheduleClose()}
              >
                {/* Trigger */}
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    "text-white/75 hover:text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                  {(link.children || link.brands) && (
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
                          key={`${child.href}:${child.label}`}
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

                {/* Brand dropdown — wide panel with brand logos */}
                {link.brands && activeDropdown === link.label && (
                  <div
                    className="absolute top-full left-0 pt-2 w-[26rem] z-50"
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="bg-popover border border-border rounded-xl shadow-xl overflow-hidden p-3">
                      <Link
                        href="/parts"
                        onClick={() => setActiveDropdown(null)}
                        className="block px-3 py-1.5 text-sm font-semibold text-orange-600 hover:bg-muted rounded-lg transition-colors"
                      >
                        Shop all parts
                      </Link>
                      <div className="mt-1">
                        <BrandRows onNavigate={() => setActiveDropdown(null)} />
                      </div>
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
              className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Search className="size-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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
              className="relative p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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
              className="lg:hidden p-2 rounded-md text-white/70 hover:bg-white/10 transition-colors"
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
                key={`${link.href}:${link.label}`}
                link={link}
                onClose={() => setMobileOpen(false)}
              />
            ))}

            {/* Quick action row */}
            <div className="pt-4 pb-2 border-t border-border mt-3 flex gap-3">
              <Link
                href="/cart"
                className="flex-1 text-center py-2.5 text-sm font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
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
