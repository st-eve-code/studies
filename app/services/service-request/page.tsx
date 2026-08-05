"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle2, Wrench, Clock, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SERVICE_TYPES = [
  "Annual Maintenance / Tune-Up",
  "Oil & Filter Change",
  "CVT Belt Replacement",
  "Suspension Service",
  "Brake Service",
  "Tire Mounting & Balancing",
  "Electrical Diagnosis",
  "Engine Rebuild / Overhaul",
  "Warranty Repair",
  "Pre-Purchase Inspection",
  "Performance Upgrade Installation",
  "Winch / Accessory Installation",
  "Other / Custom Work",
];

const TIME_SLOTS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
];

type FormState = {
  firstName: string; lastName: string; email: string; phone: string;
  vehicleYear: string; vehicleMake: string; vehicleModel: string; mileage: string;
  serviceType: string; additionalInfo: string;
  preferredDate: string; preferredTime: string;
  dropOff: boolean; waitInStore: boolean;
};

const init: FormState = {
  firstName: "", lastName: "", email: "", phone: "",
  vehicleYear: "", vehicleMake: "", vehicleModel: "", mileage: "",
  serviceType: "", additionalInfo: "",
  preferredDate: "", preferredTime: "",
  dropOff: true, waitInStore: false,
};

const inputCls = "w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500";

export default function ServiceRequestPage() {
  const [form, setForm] = useState<FormState>(init);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormState, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <div className="size-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
          <CheckCircle2 className="size-10 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black mb-2">Service Request Submitted!</h1>
          <p className="text-muted-foreground max-w-sm">
            We&rsquo;ve received your service request. Our service team will confirm your appointment within 1 business hour.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-8 py-5 text-sm space-y-2 text-left">
          <p className="flex items-center gap-2"><Calendar className="size-4 text-orange-500" /><span><strong>Requested Date:</strong> {form.preferredDate} at {form.preferredTime}</span></p>
          <p className="flex items-center gap-2"><Wrench className="size-4 text-orange-500" /><span><strong>Service:</strong> {form.serviceType}</span></p>
          <p className="flex items-center gap-2"><Clock className="size-4 text-blue-500" />Confirmation sent to {form.email}</p>
        </div>
        <Link href="/" className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Service Request</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Schedule a Service Appointment</h1>
          <p className="text-muted-foreground">Factory-trained technicians. Fast turnaround. All makes & models welcome.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Clock, label: "Fast Turnaround", sub: "Most jobs in 1–3 days" },
            { icon: Wrench, label: "All Makes", sub: "Any brand, any model" },
            { icon: CheckCircle2, label: "Certified Techs", sub: "Factory-trained staff" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
              <div className="size-10 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center shrink-0">
                <Icon className="size-5 text-orange-600" />
              </div>
              <div><p className="font-bold text-sm">{label}</p><p className="text-xs text-muted-foreground">{sub}</p></div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
          className="bg-card border border-border rounded-xl p-6 space-y-7"
        >
          {/* Vehicle info */}
          <section>
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Wrench className="size-4 text-orange-500" />Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Year</label>
                <input value={form.vehicleYear} onChange={(e) => set("vehicleYear", e.target.value)} placeholder="2024" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Make</label>
                <input value={form.vehicleMake} onChange={(e) => set("vehicleMake", e.target.value)} placeholder="Can-Am" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Model</label>
                <input value={form.vehicleModel} onChange={(e) => set("vehicleModel", e.target.value)} placeholder="Maverick X3" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Mileage / Hours</label>
                <input value={form.mileage} onChange={(e) => set("mileage", e.target.value)} placeholder="e.g. 1,250 miles" className={inputCls} />
              </div>
            </div>
          </section>

          {/* Service type */}
          <section>
            <h3 className="font-bold text-sm mb-4">Service Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SERVICE_TYPES.map((s) => (
                <label key={s} className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer text-sm transition-colors",
                  form.serviceType === s ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20 font-medium" : "border-border hover:border-orange-300"
                )}>
                  <input type="radio" name="serviceType" value={s} checked={form.serviceType === s}
                    onChange={() => set("serviceType", s)} className="accent-orange-600 shrink-0" />
                  {s}
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Additional Details</label>
              <textarea rows={4} value={form.additionalInfo} onChange={(e) => set("additionalInfo", e.target.value)}
                placeholder="Describe symptoms, noises, error codes, or work requested…"
                className={cn(inputCls, "resize-none")} />
            </div>
          </section>

          {/* Scheduling */}
          <section>
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Calendar className="size-4 text-orange-500" />Preferred Appointment</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Date</label>
                <input type="date" value={form.preferredDate} onChange={(e) => set("preferredDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Time</label>
                <select value={form.preferredTime} onChange={(e) => set("preferredTime", e.target.value)} className={inputCls}>
                  <option value="">Select time…</option>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.dropOff} onChange={(e) => set("dropOff", e.target.checked)} className="size-4 accent-orange-600" />
                Drop off vehicle
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.waitInStore} onChange={(e) => set("waitInStore", e.target.checked)} className="size-4 accent-orange-600" />
                Wait in store
              </label>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h3 className="font-bold text-sm mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">First Name</label><input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Last Name</label><input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Email</label><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Phone</label><input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} /></div>
            </div>
          </section>

          <button type="submit" className="flex items-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">
            Schedule Appointment <ArrowRight className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
