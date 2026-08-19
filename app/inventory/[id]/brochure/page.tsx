import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, MapPin, Globe } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { BrochurePrintControls } from "./print-controls";
import type { Vehicle } from "@/types/vehicle";
import logoImg from "@/components/logo/logo.jpeg";

async function getVehicle(id: string): Promise<Vehicle | null> {
  const { default: scraped } = await import("@/data/scraped-vehicles.json", {
    assert: { type: "json" },
  });
  return (scraped as Vehicle[]).find((v) => v.id === id) ?? null;
}

const conditionLabel: Record<string, string> = {
  new: "New",
  used: "Used",
  "certified-pre-owned": "Certified Pre-Owned",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) return { title: "Brochure — Vehicle Not Found" };
  return {
    title: `Brochure — ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    description: vehicle.description?.slice(0, 160),
  };
}

export default async function BrochurePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { id } = await params;
  const { print } = await searchParams;
  const vehicle = await getVehicle(id);
  if (!vehicle) notFound();

  const autoPrint = print === "1";
  const specsRows = Object.entries(vehicle.specs).filter(([, v]) => v);

  const stats: Array<{ label: string; val: string }> = [
    { label: "Condition", val: conditionLabel[vehicle.condition] ?? vehicle.condition },
    { label: "Year", val: String(vehicle.year) },
    { label: "Color", val: vehicle.color },
    ...(vehicle.mileage != null
      ? [{ label: "Miles", val: `${formatNumber(vehicle.mileage)} mi` }]
      : []),
    ...(vehicle.hours != null
      ? [{ label: "Hours", val: `${formatNumber(vehicle.hours)} hrs` }]
      : []),
    { label: "Stock #", val: vehicle.stockNumber },
    ...(vehicle.specs.horsepower
      ? [{ label: "Power", val: vehicle.specs.horsepower }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white">
      {/* ── Toolbar (never printed) ───────────────────────────────────── */}
      <div className="print:hidden max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <Link
          href={`/inventory/${vehicle.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Vehicle
        </Link>
        <BrochurePrintControls autoPrint={autoPrint} />
      </div>

      {/* ── Brochure sheet ────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white text-neutral-900 shadow-xl print:shadow-none rounded-2xl print:rounded-none overflow-hidden">
          {/* Sheet header */}
          <div className="px-8 pt-8 pb-6 border-b-4 border-orange-600">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-5">
                <Image
                  src={logoImg}
                  alt="Xtreme Powersports Inc."
                  width={1320}
                  height={1000}
                  className="h-16 w-auto object-contain"
                  priority
                />
                <div>
                  <p className="text-lg font-black tracking-tight leading-tight">
                    Xtreme Powersports Inc.
                  </p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    Columbus, Ohio&rsquo;s Premier Powersports Dealer
                  </p>
                </div>
              </div>
              <div className="text-sm text-neutral-600 space-y-1 text-right">
                <p className="flex items-center justify-end gap-1.5">
                  <Phone className="size-3.5 text-orange-600" /> (614) 555-0199
                </p>
                <p className="flex items-center justify-end gap-1.5">
                  <Mail className="size-3.5 text-orange-600" /> info@xtremepowersports.com
                </p>
                <p className="flex items-center justify-end gap-1.5">
                  <Globe className="size-3.5 text-orange-600" /> www.xtremepowersports.com
                </p>
              </div>
            </div>
          </div>

          {/* Hero: image + title + price */}
          <div className="px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/2">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
                  {vehicle.images[0] ? (
                    <Image
                      src={vehicle.images[0]}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 512px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
                      No image available
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:w-1/2 flex flex-col justify-center">
                <span className="self-start text-xs font-black uppercase tracking-widest bg-orange-600 text-white px-2.5 py-1 rounded-full mb-4">
                  {conditionLabel[vehicle.condition] ?? vehicle.condition}
                </span>

                <h1 className="text-3xl font-black leading-tight mb-1">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                {vehicle.trim && (
                  <p className="text-neutral-500 font-medium mb-5">{vehicle.trim}</p>
                )}

                <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-6">
                  {stats.map(({ label, val }) => (
                    <div key={label} className="flex items-baseline justify-between gap-2 border-b border-neutral-100 pb-1">
                      <dt className="text-[11px] uppercase tracking-wide text-neutral-400">{label}</dt>
                      <dd className="text-sm font-semibold text-right truncate">{val}</dd>
                    </div>
                  ))}
                </dl>

                <div className="flex items-end gap-3 flex-wrap">
                  {vehicle.price > 0 ? (
                    <>
                      <p className="text-4xl font-black text-neutral-900">
                        {formatCurrency(vehicle.price)}
                      </p>
                      {vehicle.msrp && vehicle.msrp > vehicle.price && (
                        <span className="text-neutral-400 line-through text-lg mb-1">
                          {formatCurrency(vehicle.msrp)}
                        </span>
                      )}
                    </>
                  ) : (
                    <p className="text-3xl font-black text-neutral-900">Call for Price</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description + specs */}
          <div className="px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-orange-600 mb-3">
                Overview
              </p>
              <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
                {vehicle.description}
              </p>
              {vehicle.dealerNotes && (
                <div className="mt-4 rounded-lg bg-orange-50 border border-orange-200 px-4 py-3">
                  <p className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-0.5">
                    Dealer Notes
                  </p>
                  <p className="text-sm text-orange-900">{vehicle.dealerNotes}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-orange-600 mb-3">
                Specifications
              </p>
              {specsRows.length > 0 ? (
                <div className="divide-y divide-neutral-100 border-y border-neutral-100">
                  {specsRows.map(([key, val]) => (
                    <div key={key} className="flex items-baseline justify-between gap-4 py-2">
                      <span className="text-sm text-neutral-500 capitalize shrink-0">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="text-sm font-semibold text-right break-words min-w-0">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400">
                  Contact us for full specifications.
                </p>
              )}
            </div>
          </div>

          {/* Features */}
          {vehicle.features.length > 0 && (
            <div className="px-8 pb-8">
              <p className="text-xs font-black uppercase tracking-widest text-orange-600 mb-3">
                Features
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {vehicle.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                    <span className="text-orange-600 font-black mt-0.5 shrink-0">&bull;</span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sheet footer */}
          <div className="bg-neutral-900 text-neutral-300 px-8 py-6 print:bg-neutral-900">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="size-4 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-semibold mb-0.5">Xtreme Powersports Inc.</p>
                  <p>1234 Powersports Blvd</p>
                  <p>Columbus, OH 43215</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="size-4 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-semibold mb-0.5">Call or Visit</p>
                  <p>(614) 555-0199</p>
                  <p>Mon&ndash;Sat 9:00 AM &ndash; 6:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Globe className="size-4 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-semibold mb-0.5">Online</p>
                  <p>www.xtremepowersports.com</p>
                  <p>info@xtremepowersports.com</p>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-neutral-700 text-[11px] text-neutral-500 space-y-1">
              <p>
                Prices do not include tax, title, registration, or dealer fees. All offers subject to
                availability. Vehicle photos may vary from the actual unit in stock.
              </p>
              <p>
                &copy; {new Date().getFullYear()} Xtreme Powersports Inc. All rights reserved. This
                brochure and its contents may not be reproduced or distributed without written
                permission. See our{" "}
                <a
                  href="/company/terms"
                  className="text-neutral-400 underline hover:text-white"
                >
                  Terms of Service &amp; Copyright Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
