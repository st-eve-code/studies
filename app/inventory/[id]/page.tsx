"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Phone,
  MessageSquare,
  Share2,
  CheckCircle2,
  Tag,
  Gauge,
  Calendar,
  Palette,
  ArrowRight,
  Printer,
} from "lucide-react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { ImageGallery } from "@/components/features/image-gallery";
import { PaymentCalculator } from "@/components/features/payment-calculator";
import { VehicleCard } from "@/components/features/vehicle-card";
import { VehicleParts } from "@/components/features/vehicle-parts";
import { StaggerReveal } from "@/components/ui/scroll-reveal";
import { VehicleDetailSkeleton } from "@/components/skeleton/page-skeleton";
import { fetchVehicleById, fetchVehicles } from "@/lib/mock-api";
import type { Vehicle } from "@/types/vehicle";

const conditionLabel: Record<string, string> = {
  new: "New",
  used: "Used",
  "certified-pre-owned": "Certified Pre-Owned",
};

const conditionStyle: Record<string, string> = {
  new: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  used: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  "certified-pre-owned":
    "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
};

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [related, setRelated] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "features">(
    "overview"
  );

  useEffect(() => {
    setLoading(true);
    fetchVehicleById(params.id).then((v) => {
      setVehicle(v);
      if (v) {
        fetchVehicles({ category: [v.category] }).then((all) =>
          setRelated(all.filter((r) => r.id !== v.id).slice(0, 3))
        );
      }
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return <VehicleDetailSkeleton />;
  if (!vehicle) return notFound();

  const specsRows = Object.entries(vehicle.specs).filter(([, v]) => v);

  const quickStats = [
    { icon: Calendar, label: "Year", val: String(vehicle.year) },
    { icon: Palette, label: "Color", val: vehicle.color },
    ...(vehicle.mileage != null
      ? [{ icon: Gauge, label: "Miles", val: `${formatNumber(vehicle.mileage)} mi` }]
      : []),
    ...(vehicle.hours != null
      ? [{ icon: Gauge, label: "Hours", val: `${formatNumber(vehicle.hours)} hrs` }]
      : []),
    { icon: Tag, label: "Stock #", val: vehicle.stockNumber },
    ...(vehicle.specs.horsepower
      ? [{ icon: Gauge, label: "Power", val: vehicle.specs.horsepower }]
      : []),
  ];

  return (
    <div className="min-h-screen">
      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center flex-wrap gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground shrink-0">Home</Link>
          <ChevronRight className="size-3 shrink-0" />
          <Link href="/inventory" className="hover:text-foreground shrink-0">Inventory</Link>
          <ChevronRight className="size-3 shrink-0" />
          <span className="text-foreground font-medium truncate min-w-0">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* ── Main two-column layout ──────────────────────────────────── */}
        {/*
          Key fix: use `items-start` so the right column doesn't stretch
          to match the left column height, allowing sticky to work correctly.
          The right column scrolls independently via its own overflow.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* ── LEFT — gallery + tabs ───────────────────────────────── */}
          <div className="min-w-0">
            <ImageGallery
              images={vehicle.images}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            />

            {/* Tabs */}
            <div className="mt-8">
              <div className="flex border-b border-border gap-0">
                {(["overview", "specs", "features"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-5 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px whitespace-nowrap",
                      activeTab === tab
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="py-6">
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <p className="text-foreground/80 leading-relaxed text-sm">
                      {vehicle.description}
                    </p>
                    {vehicle.dealerNotes && (
                      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                          Dealer Notes
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          {vehicle.dealerNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "specs" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden border border-border">
                    {specsRows.map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-start justify-between bg-card px-4 py-3 text-sm gap-4"
                      >
                        <span className="text-muted-foreground capitalize shrink-0">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="font-medium text-right break-words min-w-0">
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "features" && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {vehicle.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT — sticky details panel ───────────────────────── */}
          {/*
            `sticky top-24` works correctly because the parent grid uses
            `items-start`, so this column isn't forced to be as tall as
            the left column. The panel + calculator stack naturally.
          */}
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* Details card */}
            <div className="rounded-xl border border-border bg-card p-5">
              {/* Condition + badge pills */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={cn(
                    "text-xs font-bold px-2.5 py-0.5 rounded-full",
                    conditionStyle[vehicle.condition]
                  )}
                >
                  {conditionLabel[vehicle.condition]}
                </span>
                {vehicle.badge && (
                  <span className="text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 px-2.5 py-0.5 rounded-full">
                    {vehicle.badge}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl font-black leading-tight mb-0.5">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              {vehicle.trim && (
                <p className="text-muted-foreground text-sm mb-3">{vehicle.trim}</p>
              )}

              {/* Quick stats grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickStats.map(({ icon: Icon, label, val }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 min-w-0"
                  >
                    <Icon className="size-3.5 text-orange-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        {label}
                      </p>
                      <p className="text-xs font-semibold truncate">{val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="mb-4 pb-4 border-b border-border">
                <p className="text-3xl font-black">{formatCurrency(vehicle.price)}</p>
                {vehicle.msrp && vehicle.msrp > vehicle.price && (
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(vehicle.msrp)}
                    </span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                      Save {formatCurrency(vehicle.msrp - vehicle.price)}
                    </span>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="space-y-2">
                <a
                  href="/services/financing"
                  className="flex w-full items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition-colors"
                >
                  Apply for Financing
                  <ArrowRight className="size-4" />
                </a>
                <a
                  href="tel:+16145550199"
                  className="flex w-full items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:bg-muted font-semibold text-sm transition-colors"
                >
                  <Phone className="size-4" /> Call (614) 555-0199
                </a>
                <Link
                  href="/company/contact"
                  className="flex w-full items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:bg-muted font-semibold text-sm transition-colors"
                >
                  <MessageSquare className="size-4" /> Send a Message
                </Link>
                <button
                  onClick={() =>
                    window.open(
                      `/inventory/${vehicle.id}/brochure?print=1`,
                      "_blank",
                      "noopener"
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:bg-muted font-semibold text-sm transition-colors"
                >
                  <Printer className="size-4" /> Print Brochure
                </button>
              </div>

              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors">
                <Share2 className="size-3.5" /> Share This Vehicle
              </button>
            </div>

            {/* Payment calculator */}
            <PaymentCalculator vehiclePrice={vehicle.price} />
          </div>
        </div>

        {/* ── Parts for this vehicle ─────────────────────────────── */}
        <VehicleParts
          vehicleId={vehicle.id}
          vehicleLabel={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          vehicleYear={vehicle.year}
          vehicleMake={vehicle.make}
          vehicleModel={vehicle.model}
        />

        {/* ── Recommended vehicles ─────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-border">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-orange-600 text-xs font-bold uppercase tracking-widest mb-1">
                  You May Also Like
                </p>
                <h2 className="text-2xl font-black">Similar Vehicles</h2>
              </div>
              <Link
                href={`/inventory?category=${vehicle.category}`}
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline"
              >
                View All <ChevronRight className="size-4" />
              </Link>
            </div>

            <StaggerReveal
              stagger={0.12}
              from={{ y: 40 }}
              duration={0.6}
              ease="power3.out"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {related.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </StaggerReveal>
          </section>
        )}
      </div>
    </div>
  );
}
