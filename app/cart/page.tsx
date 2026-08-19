"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  X,
  MessageCircle,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { ProductImage } from "@/components/ui/product-image";
import { useCart } from "@/hooks/use-cart";
import type { ShippingMethod } from "@/types/cart";

const SHIPPING_OPTIONS: { id: ShippingMethod; label: string; description: string; price: number; days: string }[] = [
  { id: "pickup", label: "In-Store Pickup", description: "Free — ready in 1–2 hours", price: 0, days: "Today" },
  { id: "standard", label: "Standard Shipping", description: "USPS / UPS Ground", price: 9.99, days: "5–7 business days" },
  { id: "expedited", label: "Expedited Shipping", description: "UPS 2-Day", price: 24.99, days: "2 business days" },
  { id: "overnight", label: "Overnight Shipping", description: "UPS Next Day Air", price: 49.99, days: "Next business day" },
];

export default function CartPage() {
  const {
    items,
    totals,
    promoCode,
    promoError,
    shippingMethod,
    itemCount,
    removeItem,
    updateQty,
    clearCart,
    applyPromo,
    removePromo,
    setShipping,
  } = useCart();

  const [promoInput, setPromoInput] = useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    applyPromo(promoInput.trim());
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4">
        <ShoppingCart className="size-16 text-muted-foreground/30" />
        <div className="text-center">
          <h1 className="text-2xl font-black mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some parts or vehicles to get started.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/parts" className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">
              Shop Parts
            </Link>
            <Link href="/inventory" className="px-6 py-3 rounded-xl border border-border font-bold hover:bg-muted transition-colors">
              Browse Inventory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">Shopping Cart</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black">Shopping Cart <span className="text-muted-foreground font-normal text-base">({itemCount} {itemCount === 1 ? "item" : "items"})</span></h1>
            <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
              <Trash2 className="size-3.5" /> Clear Cart
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Cart items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                {/* Image */}
                <Link href={item.type === "vehicle" ? `/inventory/${item.productId}` : `/parts/${item.productId}`}>
                  <div className="relative size-20 sm:size-24 rounded-lg overflow-hidden bg-muted shrink-0">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      {item.brand && <p className="text-xs text-muted-foreground mb-0.5">{item.brand}</p>}
                      <Link
                        href={item.type === "vehicle" ? `/inventory/${item.productId}` : `/parts/${item.productId}`}
                        className="font-semibold text-sm leading-snug hover:text-orange-600 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      {item.sku && <p className="text-xs text-muted-foreground mt-0.5">SKU: {item.sku}</p>}
                      {item.fitmentNote && (
                        <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                          <ShieldCheck className="size-3" /> {item.fitmentNote}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity */}
                    {item.type !== "vehicle" ? (
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="px-2.5 py-1.5 hover:bg-muted transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          disabled={item.maxQty != null && item.quantity >= item.maxQty}
                          className="px-2.5 py-1.5 hover:bg-muted transition-colors disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Qty: 1</span>
                    )}
                    <p className="font-black text-base">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Shipping options */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Truck className="size-4 text-orange-500" /> Shipping Method
              </h3>
              <div className="space-y-2">
                {SHIPPING_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      shippingMethod === opt.id
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                        : "border-border hover:border-orange-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.id}
                      checked={shippingMethod === opt.id}
                      onChange={() => setShipping(opt.id)}
                      className="accent-orange-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.description} · Est. {opt.days}</p>
                    </div>
                    <p className="text-sm font-bold">{opt.price === 0 ? "Free" : formatCurrency(opt.price)}</p>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 sticky top-24">
              <h2 className="font-black text-lg mb-5">Order Summary</h2>

              {/* Promo code */}
              <form onSubmit={handleApplyPromo} className="mb-5">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-2">
                  Promo Code
                </label>
                {promoCode ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                      <Tag className="size-3.5" /> {promoCode.code} — {promoCode.description}
                    </span>
                    <button type="button" onClick={removePromo} className="text-green-600 hover:text-destructive">
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 text-sm font-semibold bg-muted hover:bg-muted/70 rounded-lg border border-border transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {promoError && <p className="text-xs text-destructive mt-1">{promoError}</p>}
                <p className="text-xs text-muted-foreground mt-1.5">Try: XTRM10 · SAVE25 · FREESHIP</p>
              </form>

              {/* Totals */}
              <div className="space-y-2.5 text-sm border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>−{formatCurrency(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{totals.shippingEstimate === 0 ? "Free" : formatCurrency(totals.shippingEstimate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Tax (7.75%)</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
                <div className="flex justify-between font-black text-base border-t border-border pt-3 mt-3">
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors"
              >
                Proceed to Checkout <ArrowRight className="size-4" />
              </Link>

              {/* Trust */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MessageCircle className="size-3.5 text-green-600" /> No online payment</span>
                <span className="flex items-center gap-1"><RotateCcw className="size-3.5" /> Order via WhatsApp</span>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Questions? Call{" "}
                <a href={`tel:${siteConfig.phoneTel}`} className="text-orange-600 hover:underline">{siteConfig.phone}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
