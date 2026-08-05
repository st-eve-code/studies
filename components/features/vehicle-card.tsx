"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Tag, Gauge, Calendar } from "lucide-react";
import { cn, formatCurrency, getSavings, formatNumber } from "@/lib/utils";
import { useWishlist } from "@/context/wishlist-context";
import type { Vehicle } from "@/types/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
  className?: string;
}

const conditionLabel: Record<string, string> = {
  new: "New",
  used: "Used",
  "certified-pre-owned": "CPO",
};

const conditionColor: Record<string, string> = {
  new: "bg-green-600",
  used: "bg-amber-600",
  "certified-pre-owned": "bg-blue-600",
};

export function VehicleCard({ vehicle, className }: VehicleCardProps) {
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(vehicle.id);
  const savings = vehicle.msrp ? getSavings(vehicle.price, vehicle.msrp) : null;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle({
      id: `wl-${vehicle.id}`,
      productId: vehicle.id,
      type: "vehicle",
      name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      image: vehicle.images[0] ?? "",
      price: vehicle.price,
      addedAt: new Date().toISOString(),
    });
  };

  return (
    <article className={cn("group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow duration-200", className)}>
      <Link href={`/inventory/${vehicle.id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden bg-muted aspect-[4/3]">
          <Image
            src={vehicle.images[0] ?? "https://picsum.photos/seed/placeholder/800/600"}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className={cn("text-[10px] font-bold uppercase tracking-wide text-white px-2 py-0.5 rounded-full", conditionColor[vehicle.condition])}>
              {conditionLabel[vehicle.condition]}
            </span>
            {vehicle.badge && (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-orange-600 text-white px-2 py-0.5 rounded-full">
                {vehicle.badge}
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-3 size-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <Heart className={cn("size-4 transition-colors", wishlisted ? "fill-rose-500 text-rose-500" : "text-white")} />
          </button>

          {/* Status overlay for sold */}
          {vehicle.status === "sold" && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-black text-2xl tracking-widest rotate-[-15deg] border-4 border-white px-3 py-1">SOLD</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{vehicle.make}</p>
          <h3 className="font-bold text-foreground text-base leading-snug mb-2">
            {vehicle.year} {vehicle.model}
            {vehicle.trim && <span className="font-normal text-muted-foreground"> {vehicle.trim}</span>}
          </h3>

          {/* Quick specs */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {vehicle.year}
            </span>
            {vehicle.mileage != null && (
              <span className="flex items-center gap-1">
                <Gauge className="size-3" />
                {formatNumber(vehicle.mileage)} mi
              </span>
            )}
            {vehicle.hours != null && (
              <span className="flex items-center gap-1">
                <Gauge className="size-3" />
                {formatNumber(vehicle.hours)} hrs
              </span>
            )}
            {vehicle.specs.horsepower && (
              <span className="flex items-center gap-1">
                <Tag className="size-3" />
                {vehicle.specs.horsepower}
              </span>
            )}
            <span className="capitalize">{vehicle.color}</span>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xl font-black text-foreground">{formatCurrency(vehicle.price)}</p>
              {savings && savings.percent >= 3 && (
                <p className="text-xs text-muted-foreground line-through">{formatCurrency(vehicle.msrp!)}</p>
              )}
            </div>
            {savings && savings.percent >= 3 && (
              <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                Save {savings.percent}%
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* CTA */}
      <div className="px-4 pb-4">
        <Link
          href={`/inventory/${vehicle.id}`}
          className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98] transition-all"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
