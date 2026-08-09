"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Star, CheckCircle2, AlertCircle } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { cn, formatCurrency, getStarArray } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/context/wishlist-context";
import { useYMM } from "@/hooks/use-ymm";
import type { Part } from "@/types/part";

interface PartCardProps {
  part: Part;
  className?: string;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const stars = getStarArray(rating);
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {stars.map((type, i) => (
          <Star
            key={i}
            className={cn(
              "size-3",
              type === "full" && "fill-amber-400 text-amber-400",
              type === "half" && "fill-amber-200 text-amber-400",
              type === "empty" && "fill-muted text-muted-foreground/40"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
}

export function PartCard({ part, className }: PartCardProps) {
  const { addItem, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { selection, hasSelection } = useYMM();

  const inCart = isInCart(part.sku);
  const wishlisted = isWishlisted(part.sku);

  const fits =
    hasSelection &&
    selection.year != null &&
    part.fitment.some(
      (f) =>
        f.year === selection.year &&
        f.make.toLowerCase() === selection.make!.toLowerCase() &&
        f.model.toLowerCase() === selection.model!.toLowerCase()
    );

  const isUniversal = part.fitment.length === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: `cart-${part.sku}-${Date.now()}`,
      productId: part.sku,
      type: "part",
      name: part.name,
      brand: part.brand,
      sku: part.sku,
      image: part.images[0] ?? "",
      price: part.price,
      quantity: 1,
      maxQty: part.stockQty,
      fitmentNote: hasSelection && selection.year && selection.make && selection.model
        ? `Fits: ${selection.year} ${selection.make} ${selection.model}`
        : undefined,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
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

  const availabilityConfig = {
    "in-stock": { label: "In Stock", color: "text-green-600", icon: CheckCircle2 },
    "out-of-stock": { label: "Out of Stock", color: "text-red-500", icon: AlertCircle },
    "special-order": { label: "Special Order", color: "text-amber-600", icon: AlertCircle },
    "discontinued": { label: "Discontinued", color: "text-muted-foreground", icon: AlertCircle },
  }[part.availability];

  const AvailIcon = availabilityConfig.icon;

  return (
    <article className={cn("group rounded-xl border border-border bg-card overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200", className)}>
      <Link href={`/parts/${part.sku}`} className="block flex-1 flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden bg-muted aspect-square">
          <ProductImage
            src={part.images[0]}
            alt={part.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Type badge */}
          <span className={cn(
            "absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full",
            part.type === "oem" && "bg-blue-600 text-white",
            part.type === "aftermarket" && "bg-purple-600 text-white",
            part.type === "performance" && "bg-orange-600 text-white"
          )}>
            {part.type === "oem" ? "OEM" : part.type === "performance" ? "Performance" : "Aftermarket"}
          </span>

          {/* Fitment badge */}
          {hasSelection && !isUniversal && (
            <span className={cn(
              "absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
              fits ? "bg-green-600 text-white" : "bg-red-500 text-white"
            )}>
              {fits ? "Fits Your Ride" : "Check Fitment"}
            </span>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute bottom-2 right-2 size-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <Heart className={cn("size-3.5 transition-colors", wishlisted ? "fill-rose-500 text-rose-500" : "text-white")} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-[11px] text-muted-foreground font-medium mb-1">{part.brand}</p>
          <h3 className="text-sm font-semibold text-foreground leading-snug mb-2 flex-1">{part.name}</h3>

          {part.reviewCount > 0 && <StarRating rating={part.rating} count={part.reviewCount} />}

          {/* Availability */}
          <div className={cn("flex items-center gap-1 text-xs mt-2 font-medium", availabilityConfig.color)}>
            <AvailIcon className="size-3.5" />
            {availabilityConfig.label}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base font-black text-foreground">{formatCurrency(part.price)}</span>
            {part.msrp && part.msrp > part.price && (
              <span className="text-xs text-muted-foreground line-through">{formatCurrency(part.msrp)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-3 pb-3">
        <button
          onClick={handleAddToCart}
          disabled={part.availability === "out-of-stock" || part.availability === "discontinued"}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all active:scale-[0.98]",
            inCart
              ? "bg-green-600 text-white"
              : "bg-orange-600 text-white hover:bg-orange-700",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <ShoppingCart className="size-3.5" />
          {inCart ? "Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
