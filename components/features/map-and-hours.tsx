"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

const hours = [
  { dept: "Showroom", schedule: siteConfig.hours.showroom },
  { dept: "Service",  schedule: siteConfig.hours.service },
  { dept: "Parts",    schedule: siteConfig.hours.parts },
];

export function MapAndHours() {

  return (
    <section className="py-20 bg-muted/10 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <ScrollReveal className="text-center mb-12">
          <p className="text-orange-600 text-sm font-bold uppercase tracking-widest mb-2">Find Us</p>
          <h2 className="text-3xl font-black mb-2">Visit Our Showroom</h2>
          <p className="text-muted-foreground text-sm">
            {siteConfig.region}&rsquo;s largest powersports showroom — over 18,000 sq ft of vehicles, parts, and gear.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-stretch">
          {/* Map embed */}
          <ScrollReveal from={{ x: -30 }} className="h-full">
            <div className="rounded-2xl overflow-hidden border border-border bg-muted relative h-full min-h-[420px]">
              <iframe
                title={`${siteConfig.name} location`}
                src={siteConfig.mapsEmbed}
                width="100%"
                height="100%"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Overlay badge */}
              <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-xl border border-border px-4 py-2.5 shadow-lg">
                <p className="text-xs font-bold flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-orange-500" />
                  {siteConfig.address.line}
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Info panel */}
          <ScrollReveal from={{ x: 30 }}>
            <div className="space-y-5">
              {/* Contact quick row */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Contact</h3>
                {[
                  { icon: Phone, label: siteConfig.phone, href: `tel:${siteConfig.phoneTel}` },
                  { icon: Mail,  label: siteConfig.email, href: `mailto:${siteConfig.email}` },
                  { icon: MapPin, label: siteConfig.address.line, href: siteConfig.mapsUrl },
                ].map(({ icon: Icon, label, href }) => (
                  <a key={label} href={href} className="flex items-start gap-3 text-sm hover:text-orange-600 transition-colors group">
                    <Icon className="size-4 text-orange-500 shrink-0 mt-0.5" />
                    <span className="break-all">{label}</span>
                  </a>
                ))}
              </div>

              {/* Hours tables */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                  <Clock className="size-4 text-orange-500" />
                  <h3 className="font-bold text-sm">Hours of Operation</h3>
                </div>
                <div className="divide-y divide-border">
                  {hours.map(({ dept, schedule }) => (
                    <div key={dept} className="px-5 py-3">
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">{dept}</p>
                      <div className="space-y-1">
                        {schedule.map(({ days, time }) => (
                          <div key={days} className="flex justify-between text-sm gap-4">
                            <span className="text-muted-foreground">{days}</span>
                            <span className={cn("font-medium", time === "Closed" && "text-red-500")}>{time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
