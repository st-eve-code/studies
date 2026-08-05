"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2, Car, Wrench, TrendingUp } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchSearchResults } from "@/lib/mock-api";
import type { SearchResult } from "@/lib/mock-api";

const POPULAR_SEARCHES = [
  "Can-Am Maverick X3",
  "Polaris RZR",
  "Yamaha YZ450F",
  "Exhaust system",
  "Skid plate",
  "LED light bar",
];

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(null);
    }
  }, [open]);

  // Fetch results on debounced query
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    fetchSearchResults(debouncedQuery)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        open ? onClose() : undefined;
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const hasResults = results && (results.vehicles.length > 0 || results.parts.length > 0);
  const noResults = results && !hasResults && debouncedQuery.trim();

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          {loading ? (
            <Loader2 className="size-5 text-orange-500 animate-spin shrink-0" />
          ) : (
            <Search className="size-5 text-muted-foreground shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vehicles, parts, brands…"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            autoComplete="off"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search">
              <X className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded border border-border">
            Esc
          </kbd>
        </div>

        {/* Results area */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Popular searches (empty state) */}
          {!query && (
            <div className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <TrendingUp className="size-3.5" /> Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-full text-sm bg-muted hover:bg-orange-100 dark:hover:bg-orange-950/30 hover:text-orange-600 transition-colors border border-border"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {noResults && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="size-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No results for &ldquo;{debouncedQuery}&rdquo;</p>
              <p className="text-sm mt-1">Try a different search term or browse categories.</p>
            </div>
          )}

          {/* Vehicles section */}
          {hasResults && results.vehicles.length > 0 && (
            <div className="p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                <Car className="size-3.5" /> Vehicles
              </p>
              <div className="space-y-1">
                {results.vehicles.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    href={`/inventory/${vehicle.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="relative size-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={vehicle.images[0]}
                        alt={vehicle.model}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                      <p className="text-xs text-muted-foreground capitalize">{vehicle.condition} · {vehicle.category.replace("-", " ")}</p>
                    </div>
                    <p className="text-sm font-bold text-orange-600 shrink-0">{formatCurrency(vehicle.price)}</p>
                  </Link>
                ))}
              </div>
              <Link
                href={`/inventory?search=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="block text-center text-xs text-orange-600 hover:underline mt-2 font-medium"
              >
                View all vehicle results →
              </Link>
            </div>
          )}

          {/* Parts section */}
          {hasResults && results.parts.length > 0 && (
            <div className="p-3 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                <Wrench className="size-3.5" /> Parts & Gear
              </p>
              <div className="space-y-1">
                {results.parts.map((part) => (
                  <Link
                    key={part.id}
                    href={`/parts/${part.sku}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="relative size-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={part.images[0]}
                        alt={part.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{part.name}</p>
                      <p className="text-xs text-muted-foreground">{part.brand} · SKU: {part.sku}</p>
                    </div>
                    <p className="text-sm font-bold text-orange-600 shrink-0">{formatCurrency(part.price)}</p>
                  </Link>
                ))}
              </div>
              <Link
                href={`/parts?search=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="block text-center text-xs text-orange-600 hover:underline mt-2 font-medium"
              >
                View all parts results →
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
          <span>Press <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">↑↓</kbd> to navigate</span>
          <span>Press <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">Enter</kbd> to select</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
