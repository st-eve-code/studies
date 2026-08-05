"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Phone, Mail, MapPin, Clock, CheckCircle2, Send } from "lucide-react";

const inputCls = "w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500";

const DEPARTMENTS = ["General Inquiry", "Parts & Accessories", "Service Department", "Sales", "Financing", "Trade-In", "Warranty", "Other"];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", department: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="size-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
          <CheckCircle2 className="size-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-black mb-1">Message Sent!</h1>
          <p className="text-muted-foreground">We&rsquo;ll get back to you within 1 business day.</p>
        </div>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Contact</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Get In Touch</h1>
          <p className="text-muted-foreground">We&rsquo;re here to help with any questions about vehicles, parts, service, or financing.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            className="bg-card border border-border rounded-xl p-6 space-y-5"
          >
            <h2 className="font-black text-lg">Send Us a Message</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Name *</label>
                <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Department</label>
                <select value={form.department} onChange={(e) => set("department", e.target.value)} className={inputCls}>
                  <option value="">Select…</option>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Subject *</label>
                <input required value={form.subject} onChange={(e) => set("subject", e.target.value)} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Message *</label>
                <textarea required rows={5} value={form.message} onChange={(e) => set("message", e.target.value)} className={`${inputCls} resize-none`} />
              </div>
            </div>
            <button type="submit" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">
              <Send className="size-4" /> Send Message
            </button>
          </form>

          {/* Contact info */}
          <div className="space-y-5">
            {[
              { icon: Phone, label: "Phone", lines: ["(614) 555-0199", "Mon–Sat 9AM–6PM"] },
              { icon: Mail, label: "Email", lines: ["info@xtremepowersports.com", "Response within 24 hours"] },
              { icon: MapPin, label: "Address", lines: ["1234 Powersports Blvd", "Columbus, OH 43215"] },
              { icon: Clock, label: "Store Hours", lines: ["Mon–Fri: 9AM–6PM", "Sat: 9AM–5PM", "Sun: 11AM–4PM"] },
            ].map(({ icon: Icon, label, lines }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-4 flex gap-4">
                <div className="size-10 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center shrink-0">
                  <Icon className="size-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-bold text-sm mb-1">{label}</p>
                  {lines.map((l) => <p key={l} className="text-sm text-muted-foreground">{l}</p>)}
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-video flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="size-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">1234 Powersports Blvd</p>
                <p className="text-xs">Columbus, OH 43215</p>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-orange-600 hover:underline">
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
