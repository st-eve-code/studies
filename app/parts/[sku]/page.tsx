"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ShoppingCart,
  Heart,
  CheckCircle2,
  AlertCircle,
  Star,
  Truck,
  RotateCcw,
  Shield,
} from "lucide-react";
import { cn, formatCurrency, getStarArray } from "@/lib/utils";
import { ImageGallery } from "@/components/features/image-gallery";
import { PartCard } from "@/components/features/part-card";
import { StaggerReveal } from "@/components/ui/scroll-reveal";
import { PartGridSkeleton } from "@/components/skeleton/part-card-skeleton";
import { fetchPartBySku, fetchParts } from "@/lib/mock-api";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/context/wishlist-context";
import { useYMM } from "@/hooks/use-ymm";
import { brandBySlug } from "@/data/brands";
import type { Part } from "@/types/part";

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex">
        {getStarArray(rating).map((type, i) => (
          <Star
            key={i}
            className={cn(
              "size-4",
              type === "full" && "fill-amber-400 text-amber-400",
              type === "half" && "fill-amber-200 text-amber-400",
              type === "empty" && "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {rating} ({count} reviews)
      </span>
    </div>
  );
}

export default function PartDetailPage() {
  const params = useParams<{ sku: string }>();
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { selection, hasSelection } = useYMM();

  const [part, setPart] = useState<Part | null>(null);
  const [related, setRelated] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "fitment">(
    "description"
  );
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPartBySku(decodeURIComponent(params.sku)).then((p) => {
      setPart(p);
      if (p) {
        fetchParts({ category: [p.category] }).then((all) =>
          setRelated(all.filter((r) => r.id !== p.id).slice(0, 4))
        );
      }
      setLoading(false);
    });
  }, [params.sku]);

  if (loading) return <PartGridSkeleton count={4} />;
  if (!part) return notFound();

  const fits =
    hasSelection &&
    part.fitment.some(
      (f) =>
        f.year === selection.year &&
        f.make?.toLowerCase() === selection.make?.toLowerCase() &&
        f.model?.toLowerCase() === selection.model?.toLowerCase()
    );

  const handleAddToCart = () => {
    addItem({
      id: `cart-${part.sku}-${Date.now()}`,
      productId: part.sku,
      type: "part",
      name: part.name,
      brand: part.brand,
      sku: part.sku,
      image: part.images[0] ?? "",
      price: part.price,
      quantity: qty,
      maxQty: part.stockQty,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2500);
  };

  const handleWishlist = () => {
    toggle({
      id: `wl-${part.sku}`,
      productId: part.sku,
      type: "part",
      name: part.name,
      image: part.images[0] ?? "",
      price: part.price,
      addedAt: new Date().toISOString(),
    });
  };

  const typeLabel = {
    oem: "OEM",
    aftermarket: "Aftermarket",
    performance: "Performance",
  }[part.type];

  const typeBadgeStyle = {
    oem: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    performance:
      "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
    aftermarket:
      "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  }[part.type];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center flex-wrap gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground shrink-0">Home</Link>
          <ChevronRight className="size-3 shrink-0" />
          <Link href="/parts" className="hover:text-foreground shrink-0">Parts</Link>
          <ChevronRight className="size-3 shrink-0" />
          {brandBySlug(part.brand.toLowerCase().replace(/[\s-]/g, "-")) ? (
            <>
              <Link
                href={`/brands/${part.brand.toLowerCase().replace(/[\s-]/g, "-")}`}
                className="hover:text-foreground shrink-0"
              >
                {part.brand}
              </Link>
              <ChevronRight className="size-3 shrink-0" />
            </>
          ) : (
            <span className="text-foreground/70 shrink-0">{part.brand}</span>
          )}
          <span className="text-foreground font-medium truncate min-w-0">{part.name}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Two-column: image | details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Gallery */}
          <div className="min-w-0">
            <ImageGallery images={part.images} alt={part.name} />
          </div>

          {/* Details */}
          <div className="min-w-0 space-y-4">
            {/* Brand + type badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-muted-foreground">
                {part.brand}
              </span>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", typeBadgeStyle)}>
                {typeLabel}
              </span>
            </div>

            <h1 className="text-2xl font-black leading-snug">{part.name}</h1>

            <StarRating rating={part.rating} count={part.reviewCount} />

            <p className="text-xs text-muted-foreground">SKU: {part.sku}</p>

            {/* Fitment indicator */}
            {hasSelection && part.fitment.length > 0 && (
              <div
                className={cn(
                  "flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold",
                  fits
                    ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                )}
              >
                {fits ? (
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                )}
                <span>
                  {fits
                    ? `Fits your ${selection.year} ${selection.make} ${selection.model}`
                    : `May not fit your ${selection.year} ${selection.make} ${selection.model} — verify fitment`}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-black">{formatCurrency(part.price)}</span>
              {part.msrp && part.msrp > part.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(part.msrp)}
                </span>
              )}
            </div>

            {/* Availability */}
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                part.availability === "in-stock" ? "text-green-600" : "text-amber-600"
              )}
            >
              {part.availability === "in-stock" ? (
                <>
                  <CheckCircle2 className="size-4 shrink-0" />
                  In Stock ({part.stockQty} available)
                </>
              ) : (
                <>
                  <AlertCircle className="size-4 shrink-0" />
                  {part.availability.replace(/-/g, " ")}
                </>
              )}
            </div>

            {/* Qty + Add to cart + Wishlist */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Quantity stepper */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden shrink-0">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2.5 hover:bg-muted transition-colors text-sm font-bold leading-none"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-4 py-2.5 text-sm font-semibold w-12 text-center leading-none">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(part.stockQty, q + 1))}
                  className="px-3 py-2.5 hover:bg-muted transition-colors text-sm font-bold leading-none"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={
                  part.availability === "out-of-stock" ||
                  part.availability === "discontinued"
                }
                className={cn(
                  "flex-1 min-w-[140px] flex items-center justify-center gap-2",
                  "py-2.5 rounded-xl font-bold text-sm transition-all",
                  addedFeedback
                    ? "bg-green-600 text-white"
                    : "bg-orange-600 text-white hover:bg-orange-700",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {addedFeedback ? (
                  <>
                    <CheckCircle2 className="size-4" /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="size-4" /> Add to Cart
                  </>
                )}
              </button>

              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                aria-label="Add to wishlist"
                className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors shrink-0"
              >
                <Heart
                  className={cn(
                    "size-5",
                    isWishlisted(part.sku) && "fill-rose-500 text-rose-500"
                  )}
                />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Orders $150+" },
                { icon: RotateCcw, label: "30-Day Returns", sub: "Easy returns" },
                { icon: Shield, label: "Genuine Parts", sub: "Authorized dealer" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center p-2.5 rounded-xl bg-muted/40">
                  <Icon className="size-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs font-semibold leading-tight">{label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className="border-b border-border mb-6 flex gap-0 overflow-x-auto">
          {(["description", "specs", "fitment"] as const).map((tab) => (
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

        <div className="mb-14 max-w-3xl">
          {activeTab === "description" && (
            <p className="text-foreground/80 leading-relaxed text-sm">
              {part.description}
            </p>
          )}

          {activeTab === "specs" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden border border-border">
              {Object.entries(part.specs)
                .filter(([, v]) => v)
                .map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-start justify-between bg-card px-4 py-3 text-sm gap-4"
                  >
                    <span className="text-muted-foreground capitalize shrink-0">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="font-medium text-right break-words min-w-0">
                      {Array.isArray(val) ? val.join(", ") : String(val)}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {activeTab === "fitment" &&
            (part.fitment.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                This is a universal-fit item — no specific fitment required.
              </p>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-semibold">Year</th>
                      <th className="text-left px-4 py-2.5 font-semibold">Make</th>
                      <th className="text-left px-4 py-2.5 font-semibold">Model</th>
                      <th className="text-left px-4 py-2.5 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {part.fitment.map((f, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                        <td className="px-4 py-2">{f.year}</td>
                        <td className="px-4 py-2">{f.make}</td>
                        <td className="px-4 py-2">{f.model}</td>
                        <td className="px-4 py-2 text-muted-foreground text-xs">
                          {f.notes ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>

        {/* ── Recommended parts ──────────────────────────────────── */}
        {related.length > 0 && (
          <section className="pt-10 border-t border-border">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black">Recommended Parts</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Commonly purchased together with this item.
                </p>
              </div>
              <Link
                href={`/parts?category=${part.category}`}
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline"
              >
                View All <ChevronRight className="size-4" />
              </Link>
            </div>

            <StaggerReveal
              stagger={0.1}
              from={{ y: 36 }}
              duration={0.55}
              ease="power2.out"
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {related.map((p) => (
                <PartCard key={p.id} part={p} />
              ))}
            </StaggerReveal>
          </section>
        )}
      </div>
    </div>
  );
}
