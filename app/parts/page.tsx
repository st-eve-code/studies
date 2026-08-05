"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PartCard } from "@/components/features/part-card";
import { YMMBar } from "@/components/features/ymm-bar";
import { PartGridSkeleton } from "@/components/skeleton/part-card-skeleton";
import { fetchParts } from "@/lib/mock-api";
import { partCategories } from "@/data/mock-categories";
import { useYMM } from "@/hooks/use-ymm";
import type { Part, PartFilters, PartCategory } from "@/types/part";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low–High" },
  { value: "price-desc", label: "Price: High–Low" },
  { value: "rating", label: "Top Rated" },
  { value: "name-asc", label: "A–Z" },
];

const PART_TYPES = [
  { id: "oem", label: "OEM" },
  { id: "aftermarket", label: "Aftermarket" },
  { id: "performance", label: "Performance" },
];

// ── Inner component — reads searchParams, must be inside Suspense ─────────────
function PartsContent() {
  const searchParams = useSearchParams();
  const { selection, hasSelection } = useYMM();

  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<PartFilters>(() => ({
    category: searchParams.get("category")
      ? [searchParams.get("category") as PartCategory]
      : undefined,
    type: searchParams.get("type") ? [searchParams.get("type") as any] : undefined,
    search: searchParams.get("search") ?? undefined,
    sortBy: "newest",
    ...(hasSelection && selection.year && selection.make && selection.model
      ? { fitmentYear: selection.year, fitmentMake: selection.make, fitmentModel: selection.model }
      : {}),
  }));

  // Re-sync if the URL changes (browser back/forward or programmatic navigation)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get("category")
        ? [searchParams.get("category") as PartCategory]
        : undefined,
      type: searchParams.get("type") ? [searchParams.get("type") as any] : undefined,
      search: searchParams.get("search") ?? undefined,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  useEffect(() => {
    setLoading(true);
    fetchParts(filters).then((data) => {
      setParts(data);
      setLoading(false);
    });
  }, [filters]);

  // Sync YMM fitment context into filters
  useEffect(() => {
    if (hasSelection && selection.year && selection.make && selection.model) {
      setFilters((f) => ({
        ...f,
        fitmentYear: selection.year!,
        fitmentMake: selection.make!,
        fitmentModel: selection.model!,
      }));
    }
  }, [hasSelection, selection.year, selection.make, selection.model]);

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
                checked={filters.type?.includes(id as any) ?? false}
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
          {partCategories.map(({ id, label, icon }) => (
            <label key={id} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.category?.includes(id) ?? false}
                onChange={() => toggleCategory(id)}
                className="size-4 rounded accent-orange-600"
              />
              <span className="text-sm group-hover:text-foreground text-foreground/80 transition-colors">
                {icon} {label}
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
            className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <button
        onClick={() => setFilters({ sortBy: filters.sortBy })}
        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );

  // Active type label for heading
  const activeTypeLabel = filters.type?.[0]
    ? filters.type[0].charAt(0).toUpperCase() + filters.type[0].slice(1)
    : null;
  const activeCategoryLabel = filters.category?.[0]
    ? filters.category[0].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;
  const headingLabel =
    activeCategoryLabel ?? (activeTypeLabel ? `${activeTypeLabel} Parts` : "Parts & Accessories");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h1 className="text-3xl font-black mb-1">{headingLabel}</h1>
          <p className="text-muted-foreground text-sm mb-5">
            OEM & aftermarket parts with guaranteed fitment. Over 10,000 SKUs in stock.
          </p>
          <YMMBar
            onApply={(y, mk, mo) =>
              setFilters((f) => ({ ...f, fitmentYear: y, fitmentMake: mk, fitmentModel: mo }))
            }
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Fitment banner */}
        {hasSelection && (
          <div className="mb-6 flex items-center justify-between bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              Showing parts that fit: {selection.year} {selection.make} {selection.model}
            </p>
            <button
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  fitmentYear: undefined,
                  fitmentMake: undefined,
                  fitmentModel: undefined,
                }))
              }
              className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1"
            >
              <X className="size-3.5" /> Remove
            </button>
          </div>
        )}

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
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:border-orange-500 transition-colors"
                  onClick={() => setMobileFilterOpen(true)}
                >
                  <SlidersHorizontal className="size-4" /> Filters
                </button>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search parts…"
                    value={filters.search ?? ""}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, search: e.target.value || undefined }))
                    }
                    className="pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 w-52"
                  />
                </div>

                <p className="text-sm text-muted-foreground hidden sm:block">
                  {loading ? "Loading…" : `${parts.length} results`}
                </p>
              </div>

              <div className="relative">
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
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none text-muted-foreground" />
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <PartGridSkeleton count={8} />
            ) : parts.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Search className="size-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold">No parts found.</p>
                <p className="text-sm mt-1">
                  Try adjusting your filters or clearing your vehicle selection.
                </p>
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
export default function PartsPage() {
  return (
    <Suspense fallback={<PartGridSkeleton count={8} />}>
      <PartsContent />
    </Suspense>
  );
}
