"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Phone,
  Shield,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { VehicleCard } from "@/components/features/vehicle-card";
import { PartCard } from "@/components/features/part-card";
import { YMMBar } from "@/components/features/ymm-bar";
import { ScrollReveal, StaggerReveal } from "@/components/ui/scroll-reveal";
import { CustomerSupport } from "@/components/features/customer-support";
import { CustomerReviews } from "@/components/features/customer-reviews";
import { MapAndHours } from "@/components/features/map-and-hours";
import { VirtualTour } from "@/components/features/virtual-tour";
import { vehicleCategories, promoBanners } from "@/data/mock-categories";
import { fetchFeaturedVehicles, fetchFeaturedParts } from "@/lib/mock-api";
import type { Vehicle } from "@/types/vehicle";
import type { Part } from "@/types/part";

// ── Hero slides ───────────────────────────────────────────────────────────────
const heroSlides = [
  {
    id: 1,
    tag: "2024 Models In Stock",
    headline: "Ride Without Limits.",
    sub: "Columbus Ohio's largest powersports dealer. ATVs, UTVs, Dirt Bikes & Watercraft.",
    ctaPrimary: { label: "Shop Inventory", href: "/inventory" },
    ctaSecondary: { label: "Get Financing", href: "/services/financing" },
    bg: "https://picsum.photos/seed/hero1/1600/900",
    accent: "from-black/80 via-black/50 to-transparent",
  },
  {
    id: 2,
    tag: "Parts & Accessories",
    headline: "Everything Your Ride Needs.",
    sub: "OEM & aftermarket parts with guaranteed fitment. Same-day local pickup available.",
    ctaPrimary: { label: "Shop Parts", href: "/parts" },
    ctaSecondary: { label: "OEM Microfiche", href: "/parts/microfiche" },
    bg: "https://picsum.photos/seed/hero2/1600/900",
    accent: "from-black/80 via-black/40 to-transparent",
  },
  {
    id: 3,
    tag: "Service Department",
    headline: "Expert Service. Fast Turnaround.",
    sub: "Factory-trained technicians for all makes and models. Schedule online today.",
    ctaPrimary: { label: "Schedule Service", href: "/services/service-request" },
    ctaSecondary: { label: "Value Your Trade", href: "/services/trade-in" },
    bg: "https://picsum.photos/seed/hero3/1600/900",
    accent: "from-black/80 via-black/40 to-transparent",
  },
];

const trustBadges = [
  { icon: Shield, label: "Authorized Dealer", sub: "Can-Am · Polaris · Yamaha · Honda" },
  { icon: Truck, label: "Free Shipping $150+", sub: "On all orders over $150" },
  { icon: Wrench, label: "Expert Service", sub: "Factory-trained technicians" },
  { icon: Phone, label: "Local Support", sub: "(614) 555-0199" },
];

// ── Hero content animator ─────────────────────────────────────────────────────
function HeroContent({
  slide,
}: {
  slide: (typeof heroSlides)[number];
}) {
  const tagRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [tagRef.current, headRef.current, subRef.current, ctaRef.current];
    if (els.some((e) => !e)) return;

    let ctx: import("gsap").gsap.Context;

    import("gsap").then(({ gsap }) => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          els,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            stagger: 0.12,
            clearProps: "transform",
          }
        );
      });
    });

    return () => ctx?.revert();
  }, [slide.id]);

  return (
    <div className="max-w-xl">
      <span
        ref={tagRef}
        className="inline-flex items-center gap-1.5 text-orange-400 text-sm font-semibold mb-3 uppercase tracking-widest opacity-0"
      >
        <Zap className="size-3.5" />
        {slide.tag}
      </span>
      <h1
        ref={headRef}
        className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 opacity-0"
      >
        {slide.headline}
      </h1>
      <p ref={subRef} className="text-white/80 text-lg mb-8 leading-relaxed opacity-0">
        {slide.sub}
      </p>
      <div ref={ctaRef} className="flex flex-wrap gap-3 opacity-0">
        <Link
          href={slide.ctaPrimary.href}
          className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all flex items-center gap-2 active:scale-[0.98]"
        >
          {slide.ctaPrimary.label}
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href={slide.ctaSecondary.href}
          className="px-6 py-3 rounded-xl border-2 border-white/40 text-white font-bold hover:bg-white/10 transition-all active:scale-[0.98]"
        >
          {slide.ctaSecondary.label}
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [featuredParts, setFeaturedParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-advance hero
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Promise.all([fetchFeaturedVehicles(), fetchFeaturedParts()]).then(([v, p]) => {
      setFeaturedVehicles(v);
      setFeaturedParts(p);
      setLoading(false);
    });
  }, []);

  const current = heroSlides[slide];

  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-[85vh] min-h-[520px] overflow-hidden">
        {heroSlides.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              i === slide ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={s.bg}
              alt={s.headline}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
            <div className={cn("absolute inset-0 bg-gradient-to-r", s.accent)} />
          </div>
        ))}

        {/* Hero content — animates on slide change */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full">
            <HeroContent slide={current} />
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "transition-all rounded-full",
                i === slide ? "w-6 h-2 bg-orange-500" : "size-2 bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      </section>

      {/* ── YMM bar ───────────────────────────────────────────────────────── */}
      <ScrollReveal from={{ y: 24 }} start="top 95%">
        <section className="bg-background border-b border-border py-6">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <YMMBar
              onApply={(y, mk, mo) => {
                window.location.href = `/parts?year=${y}&make=${encodeURIComponent(mk)}&model=${encodeURIComponent(mo)}`;
              }}
            />
          </div>
        </section>
      </ScrollReveal>

      {/* ── Trust badges ─────────────────────────────────────────────────── */}
      <section className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <StaggerReveal
            stagger={0.1}
            from={{ y: 20 }}
            duration={0.5}
            start="top 90%"
            className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border"
          >
            {trustBadges.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-6 py-4">
                <div className="size-10 rounded-lg bg-orange-600/10 flex items-center justify-center shrink-0">
                  <Icon className="size-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-bold">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ── Vehicle Categories ────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <ScrollReveal className="flex items-end justify-between mb-8">
            <div>
              <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-1">
                Shop By Type
              </p>
              <h2 className="text-3xl font-black">Browse Inventory</h2>
            </div>
            <Link
              href="/inventory"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline"
            >
              View All <ChevronRight className="size-4" />
            </Link>
          </ScrollReveal>

          <StaggerReveal
            stagger={0.07}
            from={{ y: 30, scale: 0.96 }}
            duration={0.5}
            ease="power2.out"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {vehicleCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/inventory?category=${cat.id}`}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-orange-500 hover:shadow-md transition-all"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-sm font-semibold text-center">{cat.label}</span>
                <span className="text-xs text-muted-foreground">{cat.count} listings</span>
              </Link>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ── Featured Inventory ────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <ScrollReveal className="flex items-end justify-between mb-8">
            <div>
              <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-1">
                Hand-Picked
              </p>
              <h2 className="text-3xl font-black">Featured Vehicles</h2>
            </div>
            <Link
              href="/inventory"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline"
            >
              Full Inventory <ChevronRight className="size-4" />
            </Link>
          </ScrollReveal>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <StaggerReveal
              stagger={0.12}
              from={{ y: 50 }}
              duration={0.65}
              ease="power3.out"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuredVehicles.slice(0, 6).map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </StaggerReveal>
          )}
        </div>
      </section>

      {/* ── Promo Banners ─────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <StaggerReveal
            stagger={0.15}
            from={{ y: 40, scale: 0.97 }}
            duration={0.6}
            ease="power2.out"
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {promoBanners.map((banner) => (
              <div
                key={banner.id}
                className={cn(
                  "relative rounded-2xl overflow-hidden p-7 bg-gradient-to-br text-white",
                  banner.bgColor
                )}
              >
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-white/20 rounded-full px-2.5 py-0.5 mb-3">
                  {banner.badge}
                </span>
                <h3 className="text-xl font-black mb-1">{banner.title}</h3>
                <p className="text-sm text-white/80 mb-5">{banner.subtitle}</p>
                <Link
                  href={banner.ctaHref}
                  className="inline-flex items-center gap-1.5 text-sm font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                >
                  {banner.ctaText} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ── Featured Parts ────────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <ScrollReveal className="flex items-end justify-between mb-8">
            <div>
              <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-1">
                Top Sellers
              </p>
              <h2 className="text-3xl font-black">Popular Parts & Gear</h2>
            </div>
            <Link
              href="/parts"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline"
            >
              All Parts <ChevronRight className="size-4" />
            </Link>
          </ScrollReveal>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <StaggerReveal
              stagger={0.08}
              from={{ y: 40 }}
              duration={0.55}
              ease="power2.out"
              className="grid grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {featuredParts.slice(0, 8).map((p) => (
                <PartCard key={p.id} part={p} />
              ))}
            </StaggerReveal>
          )}
        </div>
      </section>

      {/* ── CTA Band ──────────────────────────────────────────────────────── */}
      <ScrollReveal from={{ y: 30 }} duration={0.6}>
        <section className="bg-orange-600 py-14">
          <div className="max-w-7xl mx-auto px-4 text-center text-white">
            <h2 className="text-3xl font-black mb-3">Ready to Get on the Trail?</h2>
            <p className="text-orange-100 mb-8 max-w-xl mx-auto">
              Financing available for all credit types. Get pre-approved in minutes and drive home today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/services/financing"
                className="px-8 py-3.5 rounded-xl bg-white text-orange-600 font-bold hover:bg-orange-50 transition-colors"
              >
                Apply for Financing
              </Link>
              <a
                href="tel:+16145550199"
                className="px-8 py-3.5 rounded-xl border-2 border-white/50 text-white font-bold hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Phone className="size-4" /> (614) 555-0199
              </a>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Brands ────────────────────────────────────────────────────────── */}
      <section className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <ScrollReveal from={{ y: 16 }} duration={0.5}>
            <p className="text-center text-sm text-muted-foreground font-semibold uppercase tracking-widest mb-8">
              Authorized Dealer For
            </p>
          </ScrollReveal>
          <StaggerReveal
            stagger={0.06}
            from={{ y: 20, opacity: 0 }}
            duration={0.4}
            ease="power2.out"
            className="flex flex-wrap items-center justify-center gap-8"
          >
            {["Can-Am", "Polaris", "Yamaha", "Honda", "Kawasaki", "KTM", "Sea-Doo", "Ski-Doo"].map(
              (brand) => (
                <Link
                  key={brand}
                  href={`/inventory?make=${encodeURIComponent(brand)}`}
                  className="text-lg font-black text-muted-foreground hover:text-orange-600 transition-colors tracking-tight"
                >
                  {brand}
                </Link>
              )
            )}
          </StaggerReveal>
        </div>
      </section>

      {/* ── Customer Support ──────────────────────────────────────────────── */}
      <CustomerSupport />

      {/* ── Customer Reviews ──────────────────────────────────────────────── */}
      <CustomerReviews />

      {/* ── Virtual Tour ──────────────────────────────────────────────────── */}
      <VirtualTour />

      {/* ── Map & Hours ───────────────────────────────────────────────────── */}
      <MapAndHours />
    </div>
  );
}
