"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Package,
  MessageCircle,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { OrderReceipt } from "@/components/features/order-receipt";
import { buildOrderRef } from "@/lib/receipt";
import { useCart } from "@/hooks/use-cart";
import type { CheckoutState } from "@/types/cart";

const STEPS = [
  { id: 1, label: "Review" },
  { id: 2, label: "Review & Send" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className={cn(
            "flex items-center justify-center size-8 rounded-full text-xs font-bold border-2 transition-all",
            current > step.id ? "bg-green-600 border-green-600 text-white"
              : current === step.id ? "bg-orange-600 border-orange-600 text-white"
              : "border-border text-muted-foreground"
          )}>
            {current > step.id ? <CheckCircle2 className="size-4" /> : step.id}
          </div>
          <span className={cn(
            "hidden sm:block text-xs font-medium ml-2",
            current === step.id ? "text-foreground" : "text-muted-foreground"
          )}>{step.label}</span>
          {i < STEPS.length - 1 && (
            <div className={cn("w-8 sm:w-16 h-0.5 mx-2", current > step.id ? "bg-green-600" : "bg-border")} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, totals, shippingMethod } = useCart();
  const [state, setState] = useState<CheckoutState>({
    step: 1,
    orderNotes: "",
  });

  const back = () =>
    setState((s) => ({ ...s, step: (Math.max(1, s.step - 1) as CheckoutState["step"]) }));

  const showReceipt = () => {
    const orderRef = buildOrderRef();
    setState((s) => ({ ...s, step: 2, orderRef }));
  };

  if (items.length === 0 && state.step !== 2) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Package className="size-14 text-muted-foreground/30" />
        <h1 className="text-xl font-black">Your cart is empty</h1>
        <Link href="/parts" className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">Continue Shopping</Link>
      </div>
    );
  }

  // Order request — payment completed by contacting the dealer
  if (state.step === 2) {
    return (
      <div className="min-h-[70vh] py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="size-20 mx-auto bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
            <MessageCircle className="size-10 text-[#25D366]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-4 mb-2">Your receipt is ready to send!</h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Review your receipt below, then hit Complete Order via WhatsApp to send it to
            us pre-filled — we&rsquo;ll confirm availability, final price, and next steps.
            You can also copy the receipt to message us another way. Your receipt stays
            saved here until you remove your items.
          </p>
        </div>

        <OrderReceipt
          items={items}
          totals={totals}
          shippingMethod={shippingMethod}
          orderRef={state.orderRef}
          notes={state.orderNotes}
        />

        <div className="max-w-3xl mx-auto mt-8 flex gap-3 flex-wrap justify-center">
          <button
            onClick={back}
            className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft className="inline size-4 mr-1.5 -mt-0.5" /> Back
          </button>
          <Link href="/cart" className="px-6 py-3 rounded-xl border border-border font-bold hover:bg-muted transition-colors">
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border py-6">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <Link href="/cart" className="hover:text-foreground">Cart</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">Checkout</span>
          </div>
          <StepIndicator current={state.step} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main form */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-8">
            {/* Step 1 — Review */}
            {state.step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black">Review Your Order</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Take a look at your items below, add any notes, then send the receipt to us
                    on WhatsApp — no payment is collected on this website.
                  </p>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="relative size-14 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium line-clamp-2">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
                  {totals.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatCurrency(totals.discount)}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{totals.shippingEstimate === 0 ? "Free" : formatCurrency(totals.shippingEstimate)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(totals.tax)}</span></div>
                  <div className="flex justify-between font-black text-base border-t pt-3"><span>Total</span><span>{formatCurrency(totals.total)}</span></div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Order Notes (optional)</label>
                  <textarea
                    rows={3}
                    value={state.orderNotes}
                    onChange={(e) => setState((s) => ({ ...s, orderNotes: e.target.value }))}
                    placeholder="Special instructions, call before delivery, etc."
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-green-600 shrink-0 mt-0.5" />
                  <span>
                    No payment is taken online. Review the receipt, then send it to us on WhatsApp
                    to confirm availability and final pricing. See our{" "}
                    <Link href="/company/privacy" className="underline hover:text-foreground">Privacy Policy</Link> and Terms of Service.
                  </span>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Link href="/cart" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="size-4" /> Back to Cart
              </Link>
              <button onClick={showReceipt} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">
                Review Receipt <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Mini summary */}
          <div className="rounded-xl border border-border bg-card p-5 h-fit sticky top-24">
            <h3 className="font-bold text-sm mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex gap-2 text-xs">
                  <div className="relative size-10 rounded overflow-hidden bg-muted shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-muted-foreground">Qty {item.quantity} · {formatCurrency(item.price)}</p>
                  </div>
                </div>
              ))}
              {items.length > 3 && <p className="text-xs text-muted-foreground">+{items.length - 3} more items</p>}
            </div>
            <div className="border-t border-border pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
              <div className="flex justify-between font-black"><span>Total</span><span>{formatCurrency(totals.total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
