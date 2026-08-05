"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingCart, ChevronRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/hooks/use-cart";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Heart className="size-14 text-muted-foreground/30" />
        <div>
          <h1 className="text-xl font-black mb-2">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-5">Save vehicles and parts you&rsquo;re interested in.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/inventory" className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">Browse Vehicles</Link>
            <Link href="/parts" className="px-5 py-2.5 rounded-xl border border-border font-bold hover:bg-muted transition-colors">Shop Parts</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 border-b border-border py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">Wishlist</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black">My Wishlist <span className="text-muted-foreground font-normal text-base">({items.length})</span></h1>
            <button onClick={clearWishlist} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
              <Trash2 className="size-3.5" /> Clear All
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card overflow-hidden group">
              <Link href={item.type === "vehicle" ? `/inventory/${item.productId}` : `/parts/${item.productId}`}>
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  <Image
                    src={item.image || "https://picsum.photos/seed/wishlist/400/300"}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <span className={cn("absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                    item.type === "vehicle" ? "bg-blue-600 text-white" : "bg-orange-600 text-white"
                  )}>
                    {item.type}
                  </span>
                </div>
              </Link>
              <div className="p-4">
                <Link href={item.type === "vehicle" ? `/inventory/${item.productId}` : `/parts/${item.productId}`}
                  className="font-semibold text-sm hover:text-orange-600 transition-colors line-clamp-2 block mb-2">{item.name}</Link>
                <div className="flex items-center justify-between">
                  <p className="font-black text-lg">{formatCurrency(item.price)}</p>
                  <div className="flex gap-2">
                    {item.type === "part" && (
                      <button
                        onClick={() => addItem({ id: `cart-${item.productId}-${Date.now()}`, productId: item.productId, type: item.type, name: item.name, image: item.image, price: item.price, quantity: 1 })}
                        className="p-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart className="size-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 rounded-lg border border-border hover:border-destructive hover:text-destructive transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
