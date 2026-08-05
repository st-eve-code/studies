"use client";

import { useState, useEffect } from "react";
import { ChevronDown, X, CheckCircle2, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { useYMM } from "@/hooks/use-ymm";
import {
  availableYears,
  getMakesForYear,
  getModelsForYearMake,
  getTrimsForYMM,
} from "@/data/mock-ymm-tree";

interface SelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function YMMSelect({ label, value, options, onChange, disabled, placeholder }: SelectProps) {
  return (
    <div className="relative flex-1 min-w-0">
      <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || options.length === 0}
          className={cn(
            "w-full appearance-none bg-background border border-border rounded-lg",
            "px-3 py-2 pr-8 text-sm font-medium text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
            "disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          )}
        >
          <option value="">{placeholder ?? `Select ${label}`}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

interface YMMBarProps {
  className?: string;
  onApply?: (year: number, make: string, model: string, trim?: string) => void;
  compact?: boolean;
}

export function YMMBar({ className, onApply, compact = false }: YMMBarProps) {
  const { selection, setYear, setMake, setModel, setTrim, clearSelection, hasSelection, label } = useYMM();

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [trims, setTrims] = useState<string[]>([]);

  // Cascade updates
  useEffect(() => {
    if (selection.year) {
      setMakes(getMakesForYear(selection.year));
    } else {
      setMakes([]);
    }
  }, [selection.year]);

  useEffect(() => {
    if (selection.year && selection.make) {
      const modelEntries = getModelsForYearMake(selection.year, selection.make);
      setModels(modelEntries.map((m) => m.name));
    } else {
      setModels([]);
    }
  }, [selection.year, selection.make]);

  useEffect(() => {
    if (selection.year && selection.make && selection.model) {
      setTrims(getTrimsForYMM(selection.year, selection.make, selection.model));
    } else {
      setTrims([]);
    }
  }, [selection.year, selection.make, selection.model]);

  const handleApply = () => {
    if (selection.year && selection.make && selection.model && onApply) {
      onApply(selection.year, selection.make, selection.model, selection.trim ?? undefined);
    }
  };

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-4",
        compact && "p-3",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Car className="size-4 text-orange-500" />
          <span className="text-sm font-semibold">
            {hasSelection ? (
              <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                <CheckCircle2 className="size-4" />
                {label}
              </span>
            ) : (
              "Find Parts For Your Vehicle"
            )}
          </span>
        </div>
        {hasSelection && (
          <button
            onClick={clearSelection}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
            aria-label="Clear vehicle selection"
          >
            <X className="size-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Selects */}
      <div className={cn("flex gap-3", compact ? "flex-wrap" : "flex-col sm:flex-row")}>
        <YMMSelect
          label="Year"
          value={selection.year ? String(selection.year) : ""}
          options={availableYears.map(String)}
          onChange={(v) => setYear(v ? Number(v) : null)}
        />
        <YMMSelect
          label="Make"
          value={selection.make ?? ""}
          options={makes}
          onChange={(v) => setMake(v || null)}
          disabled={!selection.year}
        />
        <YMMSelect
          label="Model"
          value={selection.model ?? ""}
          options={models}
          onChange={(v) => setModel(v || null)}
          disabled={!selection.make}
        />
        {trims.length > 0 && (
          <YMMSelect
            label="Trim"
            value={selection.trim ?? ""}
            options={trims}
            onChange={(v) => setTrim(v || null)}
            disabled={!selection.model}
            placeholder="All Trims"
          />
        )}

        {/* Apply button */}
        <div className={cn("flex items-end", compact ? "w-full" : "sm:self-end")}>
          <button
            onClick={handleApply}
            disabled={!hasSelection}
            className={cn(
              "w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-semibold transition-all",
              "bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98]",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              compact ? "mt-1" : "mb-0.5 h-[38px]"
            )}
          >
            Find Parts
          </button>
        </div>
      </div>
    </div>
  );
}
