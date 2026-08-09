"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  CheckCircle2,
  Loader2,
  Wrench,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { fetchVehicleParts, type VehiclePartsResponse } from "@/lib/mock-api";
import { ProductImage } from "@/components/ui/product-image";
import type { Part } from "@/types/part";

interface VehiclePartsProps {
  vehicleId: string;
  vehicleLabel: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
}

const PAGE = 40;

export function VehicleParts({
  vehicleId,
  vehicleLabel,
  vehicleYear,
  vehicleMake,
  vehicleModel,
}: VehiclePartsProps) {
  const { addItem } = useCart();
  const [result, setResult] = useState<VehiclePartsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("All");
  const [visible, setVisible] = useState(PAGE);
  const [added, setAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetchVehicleParts(vehicleId).then((res) => {
      if (!cancelled) {
        setResult(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  const parts = useMemo(() => result?.parts ?? [], [result]);

  const categories = useMemo(
    () => ["All", ...new Set(parts.map((p) => p.category))],
    [parts]
  );

  const filtered = useMemo(
    () =>
      category === "All"
        ? parts
        : parts.filter((p) => p.category === category),
    [parts, category]
  );

  const handleAdd = (part: Part) => {
    addItem({
      id: `cart-${part.sku}`,
      productId: part.sku,
      type: "part",
      name: part.name,
      sku: part.sku,
      image: part.images[0] ?? "",
      price: part.price,
      quantity: 1,
      fitmentNote: `Fits: ${vehicleYear} ${vehicleMake} ${vehicleModel}`,
    });
    setAdded((prev) => new Set([...prev, part.sku]));
    setTimeout(
      () => setAdded((prev) => { const n = new Set(prev); n.delete(part.sku); return n; }),
      2500
    );
  };

  return (
    <section className="mt-16 pt-10 border-t border-border">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-orange-600 text-xs font-bold uppercase tracking-widest mb-1">
            Genuine Parts &amp; Accessories
          </p>
          <h2 className="text-2xl font-black">Parts for the {vehicleLabel}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            OEM and aftermarket parts matched to the {vehicleYear} {vehicleMake} {vehicleModel}. Add to cart and checkout.
          </p>
        </div>
        {result && result.ficheModelCount > 0 && (
          <Link
            href="/parts/microfiche"
            className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:underline"
          >
            <BookOpen className="size-4" /> View OEM exploded diagrams
            <ChevronRight className="size-4" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin mr-3" /> Matching parts…
        </div>
      ) : !result || parts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground rounded-xl border border-border bg-card">
          <Wrench className="size-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">No parts cataloged yet for this vehicle.</p>
          <p className="text-sm mt-1">
            Check back soon, or browse our full parts catalog.
          </p>
          <Link
            href={`/parts`}
            className="inline-flex mt-5 px-5 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
          >
            Browse Parts
          </Link>
        </div>
      ) : (
        <div>
          {result.source === "make" && (
            <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
              Showing {vehicleMake} parts that fit this family of vehicles —
              verify the exact part number against your machine before ordering.
            </div>
          )}

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCategory(c);
                    setVisible(PAGE);
                  }}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border transition-colors",
                    category === c
                      ? "bg-orange-600 text-white border-orange-600"
                      : "border-border hover:border-orange-500 hover:text-orange-600"
                  )}
                >
                  {c === "All" ? `All (${parts.length})` : c.replace(/-/g, " ")}
                </button>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {filtered.length} matching part{filtered.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
              {filtered.slice(0, visible).map((part) => {
                const inCart = added.has(part.sku);
                const unavailable =
                  part.availability === "out-of-stock" ||
                  part.availability === "discontinued";
                return (
                  <div key={part.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="relative size-14 shrink-0 rounded-lg overflow-hidden bg-muted">
                      <ProductImage
                        src={part.images[0]}
                        alt={part.name}
                        fill
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{part.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        SKU: {part.sku} · {part.brand}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">{formatCurrency(part.price)}</p>
                      <p
                        className={cn(
                          "text-[10px] font-medium",
                          part.availability === "in-stock"
                            ? "text-green-600"
                            : "text-amber-500"
                        )}
                      >
                        {part.availability.replace(/-/g, " ")}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAdd(part)}
                      disabled={unavailable}
                      aria-label="Add to cart"
                      className={cn(
                        "shrink-0 size-9 rounded-lg flex items-center justify-center transition-colors",
                        inCart
                          ? "bg-green-600 text-white"
                          : "bg-orange-600 text-white hover:bg-orange-700",
                        "disabled:opacity-40 disabled:cursor-not-allowed"
                      )}
                    >
                      {inCart ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <ShoppingCart className="size-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {filtered.length > visible && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setVisible((v) => v + PAGE)}
                className="px-5 py-2 rounded-lg border border-border text-sm font-medium hover:border-orange-500 hover:text-orange-600 transition-colors"
              >
                Show {Math.min(PAGE, filtered.length - visible)} more
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
