"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronRight,
  Phone,
  Mail,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Package,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import type { CheckoutAddress, CheckoutState } from "@/types/cart";

const STEPS = [
  { id: 1, label: "Contact & Delivery" },
  { id: 2, label: "Review" },
  { id: 3, label: "Contact Us" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
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

function AddressForm({
  title,
  data,
  onChange,
}: {
  title: string;
  data: Partial<CheckoutAddress>;
  onChange: (d: Partial<CheckoutAddress>) => void;
}) {
  const field = (key: keyof CheckoutAddress, label: string, type = "text", half = false) => (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</label>
      <input
        type={type}
        value={(data[key] as string) ?? ""}
        onChange={(e) => onChange({ ...data, [key]: e.target.value })}
        className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
      />
    </div>
  );

  return (
    <div>
      <h3 className="font-bold text-sm mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {field("firstName", "First Name", "text", true)}
        {field("lastName", "Last Name", "text", true)}
        {field("email", "Email", "email")}
        {field("phone", "Phone", "tel")}
        {field("address1", "Street Address")}
        {field("address2", "Apt / Suite (optional)")}
        {field("city", "City", "text", true)}
        <div className="col-span-1">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">State</label>
          <select
            value={data.state ?? ""}
            onChange={(e) => onChange({ ...data, state: e.target.value })}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select…</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {field("zip", "ZIP Code", "text", true)}
        {field("country", "Country")}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, totals } = useCart();
  const [state, setState] = useState<CheckoutState>({
    step: 1,
    shippingAddress: {},
    orderNotes: "",
  });

  const next = () =>
    setState((s) => ({ ...s, step: (Math.min(3, s.step + 1) as CheckoutState["step"]) }));

  const back = () =>
    setState((s) => ({ ...s, step: (Math.max(1, s.step - 1) as CheckoutState["step"]) }));

  const toContact = () =>
    setState((s) => ({
      ...s,
      step: 3,
      orderRef: `XPS-${Date.now().toString(36).toUpperCase()}`,
    }));

  if (items.length === 0 && state.step !== 3) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Package className="size-14 text-muted-foreground/30" />
        <h1 className="text-xl font-black">Your cart is empty</h1>
        <Link href="/parts" className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">Continue Shopping</Link>
      </div>
    );
  }

  // Order request — payment completed by contacting the dealer
  if (state.step === 3) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="size-20 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center">
          <Phone className="size-10 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black mb-2">Contact Us to Complete Your Order</h1>
          <p className="text-muted-foreground max-w-xl">
            We don&rsquo;t accept payments on our website. Call or email our parts &amp; sales team to
            confirm pricing and shipping, and pay securely over the phone.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-8 py-5 text-sm space-y-2">
          <div className="flex justify-between gap-8">
            <span className="text-muted-foreground">Order Reference</span>
            <span className="font-bold">{state.orderRef}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-muted-foreground">Items</span>
            <span className="font-bold">{items.length}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-muted-foreground">Order Total</span>
            <span className="font-bold">{formatCurrency(totals.total)}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="tel:+16145550199"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors"
          >
            <Phone className="size-4" /> Call (614) 555-0199
          </a>
          <a
            href="mailto:info@xtremepowersports.com"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border font-bold hover:bg-muted transition-colors"
          >
            <Mail className="size-4" /> Email Us
          </a>
        </div>
        <p className="text-xs text-muted-foreground max-w-md">
          Have your order reference ready when you call. We accept credit/debit cards, dealership
          financing, and wire transfer by phone.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/" className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">Back to Home</Link>
          <Link href="/cart" className="px-6 py-3 rounded-xl border border-border font-bold hover:bg-muted transition-colors">Back to Cart</Link>
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
            {/* Step 1 — Contact & Delivery */}
            {state.step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-black">Contact &amp; Delivery</h2>
                <p className="text-sm text-muted-foreground">
                  Tell us where to send your order. We&rsquo;ll confirm the details and take payment
                  over the phone — no payment is collected on this website.
                </p>
                <AddressForm
                  title="Delivery Address"
                  data={state.shippingAddress}
                  onChange={(d) => setState((s) => ({ ...s, shippingAddress: d }))}
                />
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
              </div>
            )}

            {/* Step 2 — Review */}
            {state.step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-black">Review Your Order</h2>
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
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-green-600 shrink-0 mt-0.5" />
                  <span>
                    No payment is taken online. Your order is finalized by phone — see our{" "}
                    <Link href="/company/privacy" className="underline hover:text-foreground">Privacy Policy</Link> and Terms of Service.
                  </span>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {state.step > 1 ? (
                <button onClick={back} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="size-4" /> Back
                </button>
              ) : (
                <Link href="/cart" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="size-4" /> Back to Cart
                </Link>
              )}
              {state.step < 2 ? (
                <button onClick={next} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">
                  Continue <ArrowRight className="size-4" />
                </button>
              ) : (
                <button onClick={toContact} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">
                  <Phone className="size-4" /> Continue to Contact
                </button>
              )}
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
