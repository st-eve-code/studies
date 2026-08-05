"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle2,
  DollarSign,
  FileText,
  Clock,
  ShieldCheck,
  ArrowRight,
  Star,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Personal Info", "Employment", "Financial", "Submit"];

const LENDERS = [
  { name: "Sheffield Financial", logo: "🏦", specialty: "Powersports specialist lender" },
  { name: "Synchrony Bank", logo: "🏛️", specialty: "Retail financing solutions" },
  { name: "TD Auto Finance", logo: "💳", specialty: "Competitive rate programs" },
  { name: "AmeriCredit", logo: "🏢", specialty: "Special finance programs" },
];

type FormData = {
  firstName: string; lastName: string; email: string; phone: string; dob: string;
  ssn: string; address: string; city: string; state: string; zip: string;
  employerName: string; jobTitle: string; employmentStatus: string; monthsEmployed: string;
  annualIncome: string; monthlyHousingPayment: string; housingStatus: string;
  vehicleOfInterest: string; requestedAmount: string; downPayment: string; tradeIn: boolean;
  tradeYear: string; tradeMake: string; tradeModel: string; tradeValue: string;
  agreedToTerms: boolean;
};

const initial: FormData = {
  firstName: "", lastName: "", email: "", phone: "", dob: "", ssn: "",
  address: "", city: "", state: "", zip: "",
  employerName: "", jobTitle: "", employmentStatus: "employed", monthsEmployed: "",
  annualIncome: "", monthlyHousingPayment: "", housingStatus: "rent",
  vehicleOfInterest: "", requestedAmount: "", downPayment: "", tradeIn: false,
  tradeYear: "", tradeMake: "", tradeModel: "", tradeValue: "",
  agreedToTerms: false,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors";

export default function FinancingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initial);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormData, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <div className="size-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
          <CheckCircle2 className="size-10 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black mb-2">Application Received!</h1>
          <p className="text-muted-foreground max-w-sm">
            We&rsquo;ve received your financing application. A team member will contact you within 2 business hours.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-8 py-5 text-sm space-y-2 text-left">
          <p className="flex items-center gap-2"><Clock className="size-4 text-orange-500" /> Decision within 2 hours (business hours)</p>
          <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-600" /> Your information is secure and encrypted</p>
          <p className="flex items-center gap-2"><Building2 className="size-4 text-blue-500" /> Multiple lenders reviewed for best rate</p>
        </div>
        <Link href="/inventory" className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">
          Browse Inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <Link href="/services" className="hover:text-foreground">Services</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Financing</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Get Pre-Approved Today</h1>
          <p className="text-muted-foreground max-w-xl">
            Competitive rates for all credit types. Quick decisions and flexible terms. We work with multiple lenders to find your best deal.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Benefits */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Clock, label: "Fast Decisions", sub: "Response in 2 hrs" },
            { icon: Star, label: "All Credit Types", sub: "Good, fair, or bad" },
            { icon: DollarSign, label: "Competitive Rates", sub: "Starting at 0% OAC" },
            { icon: FileText, label: "Simple Process", sub: "Online or in-store" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-card">
              <div className="size-10 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center mb-2">
                <Icon className="size-5 text-orange-600" />
              </div>
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          {/* Form */}
          <div className="bg-card border border-border rounded-xl p-6">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 shrink-0">
                  <div className={cn(
                    "size-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                    i < step ? "bg-green-600 border-green-600 text-white"
                      : i === step ? "bg-orange-600 border-orange-600 text-white"
                      : "border-border text-muted-foreground"
                  )}>
                    {i < step ? <CheckCircle2 className="size-4" /> : i + 1}
                  </div>
                  <span className={cn("text-xs font-medium", i === step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
                  {i < STEPS.length - 1 && <div className={cn("w-6 h-0.5", i < step ? "bg-green-600" : "bg-border")} />}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {step === 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name"><input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputCls} /></Field>
                  <Field label="Last Name"><input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputCls} /></Field>
                  <div className="col-span-2"><Field label="Email"><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} /></Field></div>
                  <Field label="Phone"><input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} /></Field>
                  <Field label="Date of Birth"><input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} className={inputCls} /></Field>
                  <div className="col-span-2"><Field label="SSN (last 4 digits)"><input type="text" maxLength={4} placeholder="••••" value={form.ssn} onChange={(e) => set("ssn", e.target.value)} className={inputCls} /></Field></div>
                  <div className="col-span-2"><Field label="Street Address"><input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} /></Field></div>
                  <Field label="City"><input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} /></Field>
                  <Field label="State / ZIP">
                    <div className="flex gap-2">
                      <input placeholder="OH" value={form.state} maxLength={2} onChange={(e) => set("state", e.target.value)} className={cn(inputCls, "w-16")} />
                      <input placeholder="43215" value={form.zip} onChange={(e) => set("zip", e.target.value)} className={inputCls} />
                    </div>
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Field label="Employment Status">
                      <select value={form.employmentStatus} onChange={(e) => set("employmentStatus", e.target.value)} className={inputCls}>
                        <option value="employed">Employed</option>
                        <option value="self-employed">Self-Employed</option>
                        <option value="retired">Retired</option>
                        <option value="student">Student</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>
                  </div>
                  <div className="col-span-2"><Field label="Employer Name"><input value={form.employerName} onChange={(e) => set("employerName", e.target.value)} className={inputCls} /></Field></div>
                  <Field label="Job Title"><input value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} className={inputCls} /></Field>
                  <Field label="Months at Job"><input type="number" value={form.monthsEmployed} onChange={(e) => set("monthsEmployed", e.target.value)} className={inputCls} /></Field>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><Field label="Annual Gross Income"><input type="number" placeholder="$" value={form.annualIncome} onChange={(e) => set("annualIncome", e.target.value)} className={inputCls} /></Field></div>
                  <Field label="Monthly Housing Payment"><input type="number" value={form.monthlyHousingPayment} onChange={(e) => set("monthlyHousingPayment", e.target.value)} className={inputCls} /></Field>
                  <Field label="Housing Status">
                    <select value={form.housingStatus} onChange={(e) => set("housingStatus", e.target.value)} className={inputCls}>
                      <option value="own">Own</option>
                      <option value="rent">Rent</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                  <div className="col-span-2"><Field label="Vehicle of Interest"><input placeholder="e.g. 2024 Can-Am Maverick X3" value={form.vehicleOfInterest} onChange={(e) => set("vehicleOfInterest", e.target.value)} className={inputCls} /></Field></div>
                  <Field label="Requested Loan Amount"><input type="number" placeholder="$" value={form.requestedAmount} onChange={(e) => set("requestedAmount", e.target.value)} className={inputCls} /></Field>
                  <Field label="Down Payment"><input type="number" placeholder="$" value={form.downPayment} onChange={(e) => set("downPayment", e.target.value)} className={inputCls} /></Field>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm">
                      <input type="checkbox" checked={form.tradeIn} onChange={(e) => set("tradeIn", e.target.checked)} className="size-4 rounded accent-orange-600" />
                      <span className="font-medium">I have a trade-in vehicle</span>
                    </label>
                  </div>
                  {form.tradeIn && (
                    <>
                      <Field label="Trade Year"><input value={form.tradeYear} onChange={(e) => set("tradeYear", e.target.value)} className={inputCls} /></Field>
                      <Field label="Trade Make"><input value={form.tradeMake} onChange={(e) => set("tradeMake", e.target.value)} className={inputCls} /></Field>
                      <Field label="Trade Model"><input value={form.tradeModel} onChange={(e) => set("tradeModel", e.target.value)} className={inputCls} /></Field>
                      <Field label="Estimated Trade Value"><input type="number" value={form.tradeValue} onChange={(e) => set("tradeValue", e.target.value)} className={inputCls} /></Field>
                    </>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="rounded-xl bg-muted/40 p-5 text-sm space-y-2">
                    <p className="font-bold text-base mb-3">Review & Submit</p>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Applicant</span><span className="font-medium">{form.firstName} {form.lastName}</span>
                      <span className="text-muted-foreground">Email</span><span>{form.email}</span>
                      <span className="text-muted-foreground">Vehicle</span><span>{form.vehicleOfInterest || "—"}</span>
                      <span className="text-muted-foreground">Loan Amount</span><span>{form.requestedAmount ? `$${Number(form.requestedAmount).toLocaleString()}` : "—"}</span>
                      <span className="text-muted-foreground">Down Payment</span><span>{form.downPayment ? `$${Number(form.downPayment).toLocaleString()}` : "—"}</span>
                      <span className="text-muted-foreground">Income</span><span>{form.annualIncome ? `$${Number(form.annualIncome).toLocaleString()}/yr` : "—"}</span>
                    </div>
                  </div>
                  <label className="flex items-start gap-2.5 cursor-pointer text-sm">
                    <input type="checkbox" checked={form.agreedToTerms} onChange={(e) => set("agreedToTerms", e.target.checked)} className="size-4 mt-0.5 rounded accent-orange-600" />
                    <span className="text-muted-foreground leading-relaxed">
                      I authorize Xtreme Powersports Inc. to pull my credit report and share my information with lending partners to evaluate this financing application. I agree to the <Link href="/company/privacy" className="underline text-foreground">Privacy Policy</Link>.
                    </span>
                  </label>
                </div>
              )}

              {/* Step navigation */}
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
                {step > 0 ? (
                  <button type="button" onClick={() => setStep((s) => s - 1)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">← Back</button>
                ) : <div />}
                {step < STEPS.length - 1 ? (
                  <button type="button" onClick={() => setStep((s) => s + 1)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">
                    Continue <ArrowRight className="size-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={!form.agreedToTerms} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-50">
                    <CheckCircle2 className="size-4" /> Submit Application
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Building2 className="size-4 text-orange-500" />Our Lending Partners</h3>
              <div className="space-y-3">
                {LENDERS.map((l) => (
                  <div key={l.name} className="flex items-center gap-3 text-sm">
                    <span className="text-2xl">{l.logo}</span>
                    <div>
                      <p className="font-semibold">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.specialty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" />Secure Application</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Your personal and financial information is encrypted using 256-bit SSL. We never sell your data to third parties.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
