"use client";

import { Suspense, useState, useEffect, useTransition, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { SlidersHorizontal, LayoutGrid, List, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { VehicleCard } from "@/components/features/vehicle-card";
import { VehicleFilter } from "@/components/features/vehicle-filter";
import { VehicleGridSkeleton } from "@/components/skeleton/vehicle-card-skeleton";
import { fetchVehicles } from "@/lib/mock-api";
import type { Vehicle, VehicleFilters } from "@/types/vehicle";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "year-desc", label: "Year: Newest First" },
  { value: "year-asc", label: "Year: Oldest First" },
];

// ── Inner component — reads searchParams, must be inside Suspense ─────────────
function InventoryContent() {
  const searchParams = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [, startTransition] = useTransition();

  // Initialise filters from URL query params so navbar links like
  // /inventory?category=atv pre-filter the grid on arrival.
  const [filters, setFilters] = useState<VehicleFilters>(() => ({
    category: searchParams.get("category")
      ? [searchParams.get("category") as VehicleFilters["category"] extends (infer T)[] | undefined ? T : never]
      : undefined,
    condition: searchParams.get("condition")
      ? [searchParams.get("condition") as VehicleFilters["condition"] extends (infer T)[] | undefined ? T : never]
      : undefined,
    make: searchParams.get("make") ? [searchParams.get("make")!] : undefined,
    search: searchParams.get("search") ?? undefined,
    sortBy: "newest",
  }));

  // Re-sync if the URL changes (e.g. browser back/forward)
  useEffect(() => {
    setFilters({
      category: searchParams.get("category") ? [searchParams.get("category") as any] : undefined,
      condition: searchParams.get("condition") ? [searchParams.get("condition") as any] : undefined,
      make: searchParams.get("make") ? [searchParams.get("make")!] : undefined,
      search: searchParams.get("search") ?? undefined,
      sortBy: "newest",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  useEffect(() => {
    setLoading(true);
    fetchVehicles(filters).then((data) => {
      setVehicles(data);
      setLoading(false);
    });
  }, [filters]);

  // Unfiltered catalog — powers the Shop by Make grouping.
  useEffect(() => {
    fetchVehicles().then(setAllVehicles).catch(() => {});
  }, []);

  const makeGroups = useMemo(() => {
    const map = new Map<string, { make: string; count: number; image: string }>();
    for (const v of allVehicles) {
      const g = map.get(v.make) ?? { make: v.make, count: 0, image: "" };
      g.count += 1;
      if (!g.image && v.images?.[0]) g.image = v.images[0];
      map.set(v.make, g);
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [allVehicles]);

  const toggleMake = (mk: string) => {
    startTransition(() =>
      setFilters((f) => {
        const current = f.make ?? [];
        const next = current.includes(mk)
          ? current.filter((x) => x !== mk)
          : [...current, mk];
        return { ...f, make: next.length ? next : undefined };
      })
    );
  };

  const handleFilterChange = (newFilters: VehicleFilters) => {
    startTransition(() => setFilters(newFilters));
  };

  // Active category label for the heading subtitle
  const activeCategoryLabel = filters.category?.[0]
    ? filters.category[0].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h1 className="text-3xl font-black mb-1">
            {activeCategoryLabel ? activeCategoryLabel : "Vehicle Inventory"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {activeCategoryLabel
              ? `Browse our full selection of new, used & CPO ${activeCategoryLabel}.`
              : "Browse our full selection of new, used & certified pre-owned powersports vehicles."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Shop by Make grouping */}
        {makeGroups.length > 1 && (
          <section className="mb-10">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-orange-600 text-xs font-bold uppercase tracking-widest mb-1">
                  Shop by Make
                </p>
                <h2 className="text-xl font-black">Browse Vehicles by Brand</h2>
              </div>
              {filters.make && filters.make.length > 0 && (
                <button
                  onClick={() =>
                    handleFilterChange({ ...filters, make: undefined })
                  }
                  className="text-xs font-medium text-orange-600 hover:underline"
                >
                  Clear make filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {makeGroups.map((g) => {
                const active = filters.make?.includes(g.make);
                return (
                  <button
                    key={g.make}
                    onClick={() => toggleMake(g.make)}
                    className={cn(
                      "group relative aspect-[3/2] overflow-hidden rounded-xl border bg-muted text-left transition-all",
                      active
                        ? "border-orange-500 ring-2 ring-orange-400/50"
                        : "border-border hover:border-orange-400"
                    )}
                  >
                    {g.image && (
                      <Image
                        src={g.image}
                        alt={g.make}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-2.5">
                      <span className="block text-sm font-bold text-white">
                        {g.make}
                      </span>
                      <span className="block text-xs text-white/70">
                        {g.count} vehicle{g.count === 1 ? "" : "s"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <VehicleFilter
            filters={filters}
            onChange={handleFilterChange}
            totalCount={vehicles.length}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Mobile filter button (rendered by VehicleFilter internally) */}
                <div className="lg:hidden shrink-0">
                  <VehicleFilter
                    filters={filters}
                    onChange={handleFilterChange}
                    totalCount={vehicles.length}
                  />
                </div>
                <p className="text-sm text-muted-foreground shrink-0">
                  {loading
                    ? "Loading…"
                    : `${vehicles.length} vehicle${vehicles.length !== 1 ? "s" : ""} found`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Sort */}
                <div className="relative shrink-0">
                  <select
                    value={filters.sortBy ?? "newest"}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, sortBy: e.target.value as any }))
                    }
                    className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                </div>

                {/* View toggle */}
                <div className="flex border border-border rounded-lg overflow-hidden shrink-0">
                  <button
                    onClick={() => setView("grid")}
                    className={cn(
                      "p-2 transition-colors",
                      view === "grid" ? "bg-orange-600 text-white" : "hover:bg-muted"
                    )}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={cn(
                      "p-2 transition-colors",
                      view === "list" ? "bg-orange-600 text-white" : "hover:bg-muted"
                    )}
                    aria-label="List view"
                  >
                    <List className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Vehicle grid / empty state */}
            {loading ? (
              <VehicleGridSkeleton count={6} />
            ) : vehicles.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <SlidersHorizontal className="size-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold">No vehicles match your filters.</p>
                <p className="text-sm mt-1">Try adjusting or clearing your filters.</p>
                <button
                  onClick={() => setFilters({ sortBy: "newest" })}
                  className="mt-4 px-5 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  view === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                )}
              >
                {vehicles.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page export — wraps content in Suspense so useSearchParams works ──────────
export default function InventoryPage() {
  return (
    <Suspense fallback={<VehicleGridSkeleton count={6} />}>
      <InventoryContent />
    </Suspense>
  );
}
