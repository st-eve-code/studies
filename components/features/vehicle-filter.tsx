"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VehicleFilters, VehicleCategory, VehicleCondition } from "@/types/vehicle";

interface VehicleFilterProps {
  filters: VehicleFilters;
  onChange: (filters: VehicleFilters) => void;
  totalCount: number;
  className?: string;
}

const CATEGORIES: { id: VehicleCategory; label: string }[] = [
  { id: "atv", label: "ATVs" },
  { id: "utv", label: "UTVs / Side-by-Sides" },
  { id: "dirt-bike", label: "Dirt Bikes" },
  { id: "personal-watercraft", label: "Personal Watercraft" },
  { id: "snowmobile", label: "Snowmobiles" },
  { id: "street-bike", label: "Street Bikes" },
];

const CONDITIONS: { id: VehicleCondition; label: string }[] = [
  { id: "new", label: "New" },
  { id: "used", label: "Used" },
  { id: "certified-pre-owned", label: "Certified Pre-Owned" },
];

const MAKES = ["Can-Am", "Polaris", "Yamaha", "Honda", "Kawasaki", "KTM", "Sea-Doo", "Ski-Doo", "Arctic Cat", "CFMOTO"];
const PRICE_MAX = 50000;
const YEAR_CURRENT = new Date().getFullYear();

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border last:border-0 pb-4 mb-4 last:pb-0 last:mb-0">
      <button
        className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-orange-600 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        {title}
        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {open && children}
    </div>
  );
}

function CheckOption<T extends string>({
  id, label, checked, onChange,
}: { id: T; label: string; checked: boolean; onChange: (id: T, checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(id, e.target.checked)}
        className="size-4 rounded border-border accent-orange-600"
      />
      <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{label}</span>
    </label>
  );
}

export function VehicleFilter({ filters, onChange, totalCount, className }: VehicleFilterProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleArray = <T extends string>(arr: T[] | undefined, val: T): T[] => {
    const current = arr ?? [];
    return current.includes(val) ? current.filter((v) => v !== val) : [...current, val];
  };

  const hasActiveFilters = Boolean(
    filters.condition?.length ||
    filters.category?.length ||
    filters.make?.length ||
    filters.priceMin != null ||
    filters.priceMax != null
  );

  const clearAll = () => onChange({ sortBy: filters.sortBy });

  const FilterContent = () => (
    <div className="space-y-0">
      {/* Active filters */}
      {hasActiveFilters && (
        <div className="pb-3 mb-3 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-orange-600">{totalCount} results</span>
          <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
            <X className="size-3" /> Clear all
          </button>
        </div>
      )}

      <FilterSection title="Condition">
        <div className="space-y-2">
          {CONDITIONS.map(({ id, label }) => (
            <CheckOption
              key={id}
              id={id}
              label={label}
              checked={filters.condition?.includes(id) ?? false}
              onChange={(val) =>
                onChange({ ...filters, condition: toggleArray(filters.condition, val) })
              }
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Category">
        <div className="space-y-2">
          {CATEGORIES.map(({ id, label }) => (
            <CheckOption
              key={id}
              id={id}
              label={label}
              checked={filters.category?.includes(id) ?? false}
              onChange={(val) =>
                onChange({ ...filters, category: toggleArray(filters.category, val) })
              }
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Make / Brand">
        <div className="space-y-2">
          {MAKES.map((make) => (
            <CheckOption
              key={make}
              id={make}
              label={make}
              checked={filters.make?.includes(make) ?? false}
              onChange={(val) =>
                onChange({ ...filters, make: toggleArray(filters.make, val) })
              }
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <label className="text-[10px] text-muted-foreground uppercase font-semibold">Min</label>
              <input
                type="number"
                min={0}
                max={PRICE_MAX}
                value={filters.priceMin ?? ""}
                onChange={(e) =>
                  onChange({ ...filters, priceMin: e.target.value ? Number(e.target.value) : undefined })
                }
                placeholder="$0"
                className="w-full mt-1 px-2 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] text-muted-foreground uppercase font-semibold">Max</label>
              <input
                type="number"
                min={0}
                max={PRICE_MAX}
                value={filters.priceMax ?? ""}
                onChange={(e) =>
                  onChange({ ...filters, priceMax: e.target.value ? Number(e.target.value) : undefined })
                }
                placeholder="$50,000"
                className="w-full mt-1 px-2 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          {/* Quick price buttons */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Under $5k", max: 5000 },
              { label: "Under $10k", max: 10000 },
              { label: "Under $20k", max: 20000 },
              { label: "$20k+", min: 20000 },
            ].map(({ label, min, max }) => (
              <button
                key={label}
                onClick={() => onChange({ ...filters, priceMin: min, priceMax: max })}
                className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-orange-500 hover:text-orange-600 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Year">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground uppercase font-semibold">From</label>
            <input
              type="number"
              min={2000}
              max={YEAR_CURRENT}
              value={filters.yearMin ?? ""}
              onChange={(e) =>
                onChange({ ...filters, yearMin: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="2000"
              className="w-full mt-1 px-2 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground uppercase font-semibold">To</label>
            <input
              type="number"
              min={2000}
              max={YEAR_CURRENT + 1}
              value={filters.yearMax ?? ""}
              onChange={(e) =>
                onChange({ ...filters, yearMax: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder={String(YEAR_CURRENT)}
              className="w-full mt-1 px-2 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn("hidden lg:block w-64 shrink-0", className)}>
        <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-orange-500" />
            Filter Results
          </h2>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile filter toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:border-orange-500 hover:text-orange-600 transition-colors"
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {hasActiveFilters && (
            <span className="size-5 text-[10px] font-bold bg-orange-600 text-white rounded-full flex items-center justify-center">
              {(filters.condition?.length ?? 0) + (filters.category?.length ?? 0) + (filters.make?.length ?? 0)}
            </span>
          )}
        </button>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)}>
            <div
              className="absolute left-0 top-0 bottom-0 w-80 bg-background overflow-y-auto p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold">Filter Vehicles</h2>
                <button onClick={() => setMobileOpen(false)} aria-label="Close filters">
                  <X className="size-5" />
                </button>
              </div>
              <FilterContent />
              <div className="mt-6 pt-4 border-t border-border">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors"
                >
                  Show {totalCount} Results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
