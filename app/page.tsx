"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, Truck, RotateCcw, ShieldCheck, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import extremecolumbusBg from "@/components/logo/slides/slide1.jpg";
import apriliaBanner from "@/components/logo/slides/slide2.jpg";
import motoGuzziBanner from "@/components/logo/slides/slide3.jpg";
import hondaBanner from "@/components/logo/slides/slide4.jpg";
import yamahaBanner from "@/components/logo/slides/slide5.jpg";
import { ProductImage } from "@/components/ui/product-image";
import { PartCard } from "@/components/features/part-card";
import { ScrollReveal, StaggerReveal } from "@/components/ui/scroll-reveal";
import { CustomerReviews } from "@/components/features/customer-reviews";
import { MapAndHours } from "@/components/features/map-and-hours";
import { brands, brandMatches } from "@/data/brands";
import { siteConfig } from "@/lib/site-config";
import { fetchFeaturedParts } from "@/lib/mock-api";
import type { Part } from "@/types/part";

// ── Hero slides (image-only per earlier request) ──────────────────────────────
const heroSlides = [
  { id: 1, alt: "Xtreme Powersports inventory", bg: extremecolumbusBg },
  { id: 2, alt: "Parts & accessories", bg: apriliaBanner },
  { id: 3, alt: "Service department", bg: motoGuzziBanner },
  { id: 4, alt: "New arrivals", bg: hondaBanner },
  { id: 5, alt: "Dealer direct", bg: yamahaBanner },
];

// Curated category tiles shown on the home page (image pulled from real stock)
const CATEGORY_TILES: { id: string; label: string }[] = [
  { id: "brakes", label: "Brakes & Clutches" },
  { id: "air-filter", label: "Air Filtration" },
  { id: "drivetrain", label: "Drivetrain & Belts" },
  { id: "body-plastics", label: "Body & Plastics" },
  { id: "electrical", label: "Electrical" },
  { id: "lighting", label: "Lighting" },
  { id: "tires-wheels", label: "Tires & Wheels" },
  { id: "suspension", label: "Suspension" },
];

const trustFacts = [
  { icon: Truck, label: "Free Shipping", sub: "Orders over $150" },
  { icon: RotateCcw, label: "30-Day Returns", sub: "Easy, no-haggle" },
  { icon: ShieldCheck, label: "Genuine Parts", sub: "Authorized dealer" },
  { icon: Tag, label: "No-Haggle Pricing", sub: "Fair dealer direct" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [featuredParts, setFeaturedParts] = useState<Part[]>([]);
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [catMeta, setCatMeta] = useState<Record<string, { count: number; image: string }>>({});
  const [loading, setLoading] = useState(true);

  // Auto-advance hero
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const go = (n: number) =>
    setSlide(((n % heroSlides.length) + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    Promise.all([
      fetchFeaturedParts(),
      fetch("/api/parts?limit=2000").then((r) => r.json()),
    ]).then(([parts, all]) => {
      setFeaturedParts(parts);
      const allParts = all.data as Part[];

      const counts: Record<string, number> = {};
      const cats: Record<string, { count: number; image: string }> = {};
      for (const part of allParts) {
        const c = cats[part.category];
        if (c) {
          c.count += 1;
        } else {
          cats[part.category] = { count: 1, image: part.images[0] ?? "" };
        }
        for (const brand of brands) {
          if (part.fitment.some((f) => brandMatches(brand, f.make))) {
            counts[brand.id] = (counts[brand.id] ?? 0) + 1;
          }
        }
      }
      setBrandCounts(counts);
      setCatMeta(cats);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero — dark racing strip ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-zinc-950" role="region" aria-label="Featured">
        <div className="relative w-full aspect-[1401/453] mt-[5px] sm:aspect-auto sm:h-[440px] sm:mt-0 lg:h-[540px]">
          {heroSlides.map((s, i) => (
            <div
              key={s.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === slide ? 1 : 0, zIndex: i === slide ? 2 : 1 }}
              aria-hidden={i !== slide}
            >
              <Image
                src={s.bg}
                alt={s.alt}
                fill
                priority={i === 0}
                className="object-contain object-top sm:object-cover sm:object-center"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 via-transparent to-transparent sm:from-zinc-950/85 sm:via-zinc-950/30" />
            </div>
          ))}

          {/* Content */}
          <div className="hidden sm:block max-w-7xl mx-auto px-4 md:px-6 lg:px-8 absolute inset-x-0 bottom-16 z-10">
            <ScrollReveal className="w-full">
              <div className="max-w-xl">
                <p className="text-white/60 text-xs font-bold uppercase tracking-[0.25em] mb-3">
                  Authorized Dealer · {siteConfig.region}
                </p>
                <h1 className="text-white font-black leading-tight tracking-tight text-3xl sm:text-5xl lg:text-6xl">
                  Ready to ride.
                  <br />
                  <span className="text-orange-500">Stay out there.</span>
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <Link
                    href="/parts"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-600 text-white font-bold text-sm hover:bg-orange-500 active:scale-[0.98] transition-all"
                  >
                    Shop Parts &amp; Gear
                    <ChevronRight className="size-4" />
                  </Link>
                  <Link
                    href="#brands"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/25 text-white font-bold text-sm hover:bg-white/10 transition-colors"
                  >
                    Shop by Brand
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Controls — dots + arrows */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 absolute inset-x-0 bottom-4 flex items-center justify-between pointer-events-none z-10">
            <div className="flex gap-2 pointer-events-auto">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === slide ? "w-8 bg-orange-500" : "w-2 bg-white/40 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2 pointer-events-auto">
              <button
                onClick={() => go(slide - 1)}
                aria-label="Previous slide"
                className="rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/25 transition-colors"
              >
                <ChevronLeft className="size-[18px]" />
              </button>
              <button
                onClick={() => go(slide + 1)}
                aria-label="Next slide"
                className="rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/25 transition-colors"
              >
                <ChevronRight className="size-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────────────── */}
      <section className="bg-zinc-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustFacts.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="size-10 shrink-0 rounded-lg bg-orange-600/15 text-orange-500 flex items-center justify-center">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-white text-sm font-bold leading-tight">{label}</p>
                  <p className="text-white/50 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop by Brand ────────────────────────────────────────────────── */}
      <section id="brands" className="py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <ScrollReveal className="flex flex-col items-center justify-between gap-4 mb-8 sm:flex-row sm:items-end sm:gap-0">
            <div>
              <h2 className="text-3xl font-black sm:text-4xl">Shop by Brand</h2>
              <p className="text-muted-foreground mt-1 max-w-xl text-sm">
                Parts for ATVs, side-by-sides, dirt bikes, watercraft and snowmobiles — matched to
                your machine.
              </p>
            </div>
            <Link
              href="/parts"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline"
            >
              All Parts <ChevronRight className="size-4" />
            </Link>
          </ScrollReveal>

          <StaggerReveal
            stagger={0.06}
            from={{ y: 30 }}
            duration={0.5}
            ease="power2.out"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {brands.map((b) => {
              const count = brandCounts[b.id] ?? 0;
              return (
                <Link
                  key={b.id}
                  href={`/brands/${b.id}`}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 flex flex-col items-start justify-between gap-6 hover:shadow-lg hover:border-orange-600/40 transition-all"
                >
                  {b.mark ? (
                    <Image
                      src={b.mark}
                      alt={b.label}
                      width={176}
                      height={96}
                      className={cn(
                        "h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105",
                        b.darkInvert && "dark:brightness-0 dark:invert"
                      )}
                    />
                  ) : (
                    <span className="text-3xl font-black text-foreground/20 group-hover:text-orange-600/40 transition-colors">
                      {b.label.slice(0, 4)}
                    </span>
                  )}
                  <div>
                    <span className="block text-sm font-bold group-hover:text-orange-600 transition-colors">
                      {b.label}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {count > 0 ? `${count.toLocaleString()} parts` : b.tagline}
                    </span>
                  </div>
                  <ArrowRight className="absolute top-4 right-4 size-4 text-muted-foreground/0 group-hover:text-orange-600 transition-all group-hover:-rotate-45" />
                </Link>
              );
            })}
          </StaggerReveal>
        </div>
      </section>

      {/* ── Shop by Category — real-part image tiles ─────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <ScrollReveal className="flex flex-col items-center justify-between gap-4 mb-8 sm:flex-row sm:items-end sm:gap-0">
            <div>
              <h2 className="text-3xl font-black sm:text-4xl">Shop by Category</h2>
              <p className="text-muted-foreground mt-1 max-w-xl text-sm">
                Every tile is real stock from our parts shelf — filters, belts, brakes, plastics and more.
              </p>
            </div>
            <Link
              href="/parts"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline"
            >
              Shop All Parts <ChevronRight className="size-4" />
            </Link>
          </ScrollReveal>

          <StaggerReveal
            stagger={0.05}
            from={{ y: 30, scale: 0.98 }}
            duration={0.5}
            ease="power2.out"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {CATEGORY_TILES.map((c) => {
              const meta = catMeta[c.id];
              return (
                <Link
                  key={c.id}
                  href={`/parts?category=${c.id}`}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted hover:shadow-md transition-all"
                >
                  <ProductImage
                    src={meta?.image}
                    alt={c.label}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3.5">
                    <span className="block text-sm font-bold text-white">{c.label}</span>
                    <span className="block text-xs text-white/70 mt-0.5">
                      {meta ? `${meta.count.toLocaleString()} parts` : "Browse parts"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </StaggerReveal>
        </div>
      </section>

      {/* ── Featured Parts ───────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <ScrollReveal className="flex flex-col items-center justify-between gap-4 mb-8 sm:flex-row sm:items-end sm:gap-0">
            <div>
              <h2 className="text-3xl font-black sm:text-4xl">Featured Parts</h2>
              <p className="text-muted-foreground mt-1 max-w-xl text-sm">
                Hand-picked favorites from the shop floor, ready to ship today.
              </p>
            </div>
            <Link
              href="/parts"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline"
            >
              View All <ChevronRight className="size-4" />
            </Link>
          </ScrollReveal>

          {loading ? (
            <div className="mt-6 grid grid-cols-2 max-md:grid-cols-1 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <StaggerReveal
              stagger={0.08}
              from={{ y: 40 }}
              duration={0.55}
              ease="power2.out"
              className="mt-6 grid grid-cols-2 max-md:grid-cols-1 lg:grid-cols-4 gap-5"
            >
              {featuredParts.slice(0, 8).map((p) => (
                <PartCard key={p.id} part={p} />
              ))}
            </StaggerReveal>
          )}
        </div>
      </section>

      {/* ── Customer Reviews ──────────────────────────────────────────────── */}
      <CustomerReviews />

      {/* ── Map & Hours ───────────────────────────────────────────────────── */}
      <MapAndHours />
    </div>
  );
}
