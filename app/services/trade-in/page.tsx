"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle2, Car, DollarSign, ArrowRight, RefreshCw } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type FormState = {
  year: string; make: string; model: string; trim: string;
  mileage: string; hours: string; condition: string; color: string;
  hasTitle: boolean; hasLien: boolean; lienholder: string;
  modifications: string; knownIssues: string;
  firstName: string; lastName: string; email: string; phone: string;
  interestedIn: string;
};

const init: FormState = {
  year: "", make: "", model: "", trim: "", mileage: "", hours: "",
  condition: "good", color: "", hasTitle: true, hasLien: false, lienholder: "",
  modifications: "", knownIssues: "",
  firstName: "", lastName: "", email: "", phone: "", interestedIn: "",
};

const inputCls = "w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500";

const CONDITIONS = [
  { id: "excellent", label: "Excellent", sub: "Like new — minimal use, no damage" },
  { id: "good", label: "Good", sub: "Normal wear — fully functional" },
  { id: "fair", label: "Fair", sub: "Visible wear, minor issues" },
  { id: "poor", label: "Poor", sub: "Needs significant work" },
];

// Mock estimate calculator
function getEstimate(form: FormState): { low: number; high: number } | null {
  if (!form.year || !form.make || !form.mileage) return null;
  const base = 8000;
  const age = new Date().getFullYear() - Number(form.year);
  const conditionMultiplier = { excellent: 1.2, good: 1.0, fair: 0.75, poor: 0.5 }[form.condition] ?? 1;
  const mileagePenalty = Math.min(Number(form.mileage) * 0.05, 3000);
  const value = Math.max(500, (base - age * 400 - mileagePenalty) * conditionMultiplier);
  return { low: Math.round(value * 0.9), high: Math.round(value * 1.1) };
}

export default function TradeInPage() {
  const [form, setForm] = useState<FormState>(init);
  const [submitted, setSubmitted] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);

  const set = (key: keyof FormState, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const estimate = getEstimate(form);

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <div className="size-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
          <CheckCircle2 className="size-10 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black mb-2">Trade-In Request Submitted!</h1>
          <p className="text-muted-foreground max-w-sm">
            Our appraisal team will review your submission and contact you within 1 business day with a firm offer.
          </p>
        </div>
        {estimate && (
          <div className="rounded-xl border border-border bg-card px-8 py-5">
            <p className="text-xs text-muted-foreground mb-1">Estimated Trade Value</p>
            <p className="text-2xl font-black text-orange-600">{formatCurrency(estimate.low)} – {formatCurrency(estimate.high)}</p>
            <p className="text-xs text-muted-foreground mt-1">Final offer subject to in-person inspection</p>
          </div>
        )}
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/inventory" className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">Browse New Rides</Link>
          <Link href="/" className="px-6 py-3 rounded-xl border border-border font-bold hover:bg-muted transition-colors">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Trade-In Valuation</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Value Your Trade-In</h1>
          <p className="text-muted-foreground max-w-xl">Get an instant estimate and submit your trade-in for a firm appraisal. We accept all makes and models.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="bg-card border border-border rounded-xl p-6 space-y-7">
            {/* Vehicle details */}
            <section>
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Car className="size-4 text-orange-500" />Vehicle Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Year *</label><input required value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="2022" className={inputCls} /></div>
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Make *</label><input required value={form.make} onChange={(e) => set("make", e.target.value)} placeholder="Can-Am" className={inputCls} /></div>
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Model *</label><input required value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="Defender Max" className={inputCls} /></div>
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Trim</label><input value={form.trim} onChange={(e) => set("trim", e.target.value)} placeholder="HD10 Limited" className={inputCls} /></div>
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Mileage *</label><input required type="number" value={form.mileage} onChange={(e) => set("mileage", e.target.value)} placeholder="e.g. 1500" className={inputCls} /></div>
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Engine Hours</label><input type="number" value={form.hours} onChange={(e) => set("hours", e.target.value)} placeholder="e.g. 210" className={inputCls} /></div>
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Color</label><input value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="e.g. Desert Tan" className={inputCls} /></div>
              </div>
            </section>

            {/* Condition */}
            <section>
              <h3 className="font-bold text-sm mb-4">Overall Condition</h3>
              <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map(({ id, label, sub }) => (
                  <label key={id} className={cn(
                    "flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer text-sm transition-colors",
                    form.condition === id ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" : "border-border hover:border-orange-300"
                  )}>
                    <input type="radio" name="condition" value={id} checked={form.condition === id}
                      onChange={() => set("condition", id)} className="accent-orange-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Title & lien */}
            <section className="space-y-3">
              <h3 className="font-bold text-sm mb-2">Title & Lien Status</h3>
              <label className="flex items-center gap-2.5 cursor-pointer text-sm">
                <input type="checkbox" checked={form.hasTitle} onChange={(e) => set("hasTitle", e.target.checked)} className="size-4 accent-orange-600" />
                I have the title in my possession
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-sm">
                <input type="checkbox" checked={form.hasLien} onChange={(e) => set("hasLien", e.target.checked)} className="size-4 accent-orange-600" />
                There is a lien / loan on this vehicle
              </label>
              {form.hasLien && (
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Lienholder</label><input value={form.lienholder} onChange={(e) => set("lienholder", e.target.value)} placeholder="Bank name" className={inputCls} /></div>
              )}
            </section>

            {/* Modifications */}
            <section className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Modifications / Upgrades</label>
                <textarea rows={2} value={form.modifications} onChange={(e) => set("modifications", e.target.value)} placeholder="Lift kit, exhaust, wheels, etc." className={cn(inputCls, "resize-none")} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Known Issues / Damage</label>
                <textarea rows={2} value={form.knownIssues} onChange={(e) => set("knownIssues", e.target.value)} placeholder="Any mechanical issues, cosmetic damage, etc." className={cn(inputCls, "resize-none")} />
              </div>
            </section>

            {/* Contact + new vehicle interest */}
            <section className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">First Name *</label><input required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Last Name *</label><input required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Email *</label><input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Phone</label><input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} /></div>
              <div className="col-span-2"><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Interested In (optional)</label><input value={form.interestedIn} onChange={(e) => set("interestedIn", e.target.value)} placeholder="e.g. 2024 Polaris RZR Pro R" className={inputCls} /></div>
            </section>

            <button type="submit" className="flex items-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">
              Submit Trade-In <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Estimate sidebar */}
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 sticky top-24">
              <h3 className="font-bold text-sm mb-1 flex items-center gap-2"><DollarSign className="size-4 text-orange-500" />Instant Estimate</h3>
              <p className="text-xs text-muted-foreground mb-4">Fill in Year, Make, and Mileage for an instant range.</p>
              {estimate ? (
                <div className="text-center">
                  <p className="text-2xl font-black text-orange-600">{formatCurrency(estimate.low)}<span className="text-lg text-muted-foreground"> – </span>{formatCurrency(estimate.high)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Estimated trade value</p>
                  <p className="text-[10px] text-muted-foreground mt-2">Final value subject to in-person appraisal.</p>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <RefreshCw className="size-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Fill in vehicle details to see estimate</p>
                </div>
              )}
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-sm space-y-3">
              <h3 className="font-bold">Why Trade With Us?</h3>
              {["No obligation appraisal", "Competitive market-based offers", "Apply trade value to any vehicle", "We pay off your existing loan", "Same-day paperwork"].map((item) => (
                <p key={item} className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="size-4 text-green-500 shrink-0" />{item}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
