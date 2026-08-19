"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams, notFound } from "next/navigation";
import { ChevronDown, Search, SlidersHorizontal, X, ArrowRight } from "lucide-react";
import { PartCard } from "@/components/features/part-card";
import { PartGridSkeleton } from "@/components/skeleton/part-card-skeleton";
import { fetchParts } from "@/lib/mock-api";
import { partCategories } from "@/data/mock-categories";
import { brands, brandBySlug } from "@/data/brands";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Part, PartFilters, PartCategory, PartType } from "@/types/part";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low–High" },
  { value: "price-desc", label: "Price: High–Low" },
  { value: "rating", label: "Top Rated" },
  { value: "name-asc", label: "A–Z" },
];

const PART_TYPES: { id: PartType; label: string }[] = [
  { id: "oem", label: "OEM" },
  { id: "aftermarket", label: "Aftermarket" },
  { id: "performance", label: "Performance" },
];

// ── Inner component — reads params + searchParams, must be inside Suspense ────
function BrandContent() {
  const params = useParams<{ brand: string }>();
  const brand = brandBySlug(params.brand);
  const searchParams = useSearchParams();

  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<PartFilters>(() => ({
    category: searchParams.get("category")
      ? [searchParams.get("category") as PartCategory]
      : undefined,
      type: searchParams.get("type")
        ? [searchParams.get("type") as PartType]
        : undefined,
      search: searchParams.get("search") ?? undefined,
      sortBy: "newest",
    }));

  // Re-sync if the URL changes (browser back/forward or programmatic navigation)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get("category")
        ? [searchParams.get("category") as PartCategory]
        : undefined,
      type: searchParams.get("type")
        ? [searchParams.get("type") as PartType]
        : undefined,
      search: searchParams.get("search") ?? undefined,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // Every fetch is constrained to this brand — the brand page shows only brand parts.
  useEffect(() => {
    if (!brand) return;
    setLoading(true);
    fetchParts({ ...filters, brand: [brand.label] }).then((data) => {
      setParts(data);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, brand?.label]);

  if (!brand) return notFound();

  const toggleCategory = (id: PartCategory) => {
    setFilters((f) => {
      const current = f.category ?? [];
      return {
        ...f,
        category: current.includes(id)
          ? current.filter((c) => c !== id)
          : [...current, id],
      };
    });
  };

  const toggleType = (id: string) => {
    setFilters((f) => {
      const current = (f.type ?? []) as string[];
      return {
        ...f,
        type: current.includes(id)
          ? current.filter((t) => t !== id)
          : [...current, id],
      } as PartFilters;
    });
  };

  const clearFilters = () =>
    setFilters({ sortBy: filters.sortBy, search: undefined });

  const hasActiveFilters =
    (filters.category?.length ?? 0) > 0 ||
    (filters.type?.length ?? 0) > 0 ||
    (filters.search?.length ?? 0) > 0 ||
    filters.priceMin != null ||
    filters.priceMax != null;

  // Inline filter panel — defined inside component so it closes over state
  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Part Type
        </h3>
        <div className="space-y-2">
          {PART_TYPES.map(({ id, label }) => (
            <label key={id} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.type?.includes(id) ?? false}
                onChange={() => toggleType(id)}
                className="size-4 rounded accent-orange-600"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Category
        </h3>
        <div className="space-y-2">
          {partCategories.map(({ id, label }) => (
            <label key={id} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.category?.includes(id) ?? false}
                onChange={() => toggleCategory(id)}
                className="size-4 rounded accent-orange-600"
              />
              <span className="text-sm group-hover:text-foreground text-foreground/80 transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Price Range
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min $"
            value={filters.priceMin ?? ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                priceMin: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            className="flex-1 min-w-0 px-2 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="number"
            placeholder="Max $"
            value={filters.priceMax ?? ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                priceMax: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            className="flex-1 min-w-0 px-2 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <button
        onClick={clearFilters}
        disabled={!hasActiveFilters}
        className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* ── Brand hero — dark racing strip ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/15 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {brand.mark ? (
                <span className="shrink-0 size-16 rounded-2xl bg-white p-2 flex items-center justify-center">
                  <Image
                    src={brand.mark}
                    alt={brand.label}
                    width={176}
                    height={96}
                    className="h-9 w-auto object-contain"
                  />
                </span>
              ) : (
                <span className="shrink-0 size-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black text-orange-500">
                  {brand.label.slice(0, 3).toUpperCase()}
                </span>
              )}
              <div>
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                  {brand.label} Parts
                </h1>
                <p className="text-white/60 text-sm mt-1.5">{brand.tagline}</p>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                href="/parts"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 text-white font-bold text-sm hover:bg-orange-500 transition-colors"
              >
                Shop All Parts <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Other-brand quick nav */}
          <div className="mt-8 flex flex-wrap gap-2">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/brands/${b.id}`}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all",
                  b.id === brand.id
                    ? "border-orange-500 bg-orange-600 text-white"
                    : "border-white/20 text-white/70 hover:border-orange-500 hover:text-white"
                )}
              >
                {b.mark && (
                  <Image
                    src={b.mark}
                    alt={b.label}
                    width={36}
                    height={20}
                    className={cn(
                      "h-3.5 w-7 object-contain",
                      b.darkInvert && "dark:brightness-0 dark:invert"
                    )}
                  />
                )}
                {b.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop grid ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-orange-500" />
                Filters
              </h2>
              <FilterPanel />
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:border-orange-500 transition-colors shrink-0"
                  onClick={() => setMobileFilterOpen(true)}
                >
                  <SlidersHorizontal className="size-4" /> Filters
                </button>

                <div className="relative flex-1 min-w-0 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`Search ${brand.label} parts…`}
                    value={filters.search ?? ""}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, search: e.target.value || undefined }))
                    }
                    className="pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 w-full min-w-0 sm:w-52"
                  />
                </div>

                <p className="text-sm text-muted-foreground hidden sm:block shrink-0">
                  {loading ? "Loading…" : `${parts.length} results`}
                </p>
              </div>

              <div className="relative w-full sm:w-auto sm:ml-auto shrink-0">
                <select
                  value={filters.sortBy ?? "newest"}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, sortBy: e.target.value as PartFilters["sortBy"] }))
                  }
                  className="appearance-none w-full sm:w-auto pl-3 pr-8 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none text-muted-foreground" />
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {[
                  ...(filters.category ?? []).map((c) => ({
                    key: c,
                    label:
                      partCategories.find((p) => p.id === c)?.label ??
                      c.replace(/-/g, " "),
                  })),
                  ...(filters.type ?? []).map((t) => ({
                    key: t,
                    label: `${t.charAt(0).toUpperCase()}${t.slice(1)}`,
                  })),
                  ...(filters.search
                    ? [{ key: "search", label: `"${filters.search}"` }]
                    : []),
                  ...(filters.priceMin != null
                    ? [{ key: "min", label: `Min $${filters.priceMin}` }]
                    : []),
                  ...(filters.priceMax != null
                    ? [{ key: "max", label: `Max $${filters.priceMax}` }]
                    : []),
                ].map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => {
                      setFilters((f) => ({
                        ...f,
                        category: f.category?.filter((c) => c !== chip.key),
                        type: f.type?.filter((t) => t !== chip.key),
                        search:
                          chip.key === "search" ? undefined : f.search,
                        priceMin:
                          chip.key === "min" ? undefined : f.priceMin,
                        priceMax:
                          chip.key === "max" ? undefined : f.priceMax,
                      }));
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-600/10 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 hover:bg-orange-600/20 transition-colors"
                  >
                    {chip.label}
                    <X className="size-3" />
                  </button>
                ))}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <PartGridSkeleton count={8} />
            ) : parts.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Search className="size-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold">No {brand.label} parts found.</p>
                <p className="text-sm mt-1">Try adjusting your filters or shopping another brand.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {parts.map((p) => (
                  <PartCard key={p.id} part={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-background p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold">Filters</h2>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="mt-6 w-full py-3 rounded-xl bg-orange-600 text-white font-semibold"
            >
              Show {parts.length} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page export — wraps content in Suspense so useSearchParams works ──────────
export default function BrandPage() {
  return (
    <Suspense fallback={<PartGridSkeleton count={8} />}>
      <BrandContent />
    </Suspense>
  );
}
