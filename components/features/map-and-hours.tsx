"use client";

import { MapPin, Phone, Mail, Clock, Navigation, ExternalLink } from "lucide-react";
import { ScrollReveal, StaggerReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";

const hours = [
  { dept: "Showroom",      schedule: [{ days: "Mon – Fri", time: "9:00 AM – 6:00 PM" }, { days: "Saturday", time: "9:00 AM – 5:00 PM" }, { days: "Sunday", time: "11:00 AM – 4:00 PM" }] },
  { dept: "Service",       schedule: [{ days: "Mon – Fri", time: "8:00 AM – 5:30 PM" }, { days: "Saturday", time: "9:00 AM – 3:00 PM" }, { days: "Sunday", time: "Closed" }] },
  { dept: "Parts",         schedule: [{ days: "Mon – Sat", time: "8:00 AM – 6:00 PM" }, { days: "Sunday", time: "11:00 AM – 4:00 PM" }, { days: "Online", time: "24 / 7" }] },
];

function isOpenNow(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 6 = Sat
  const hour = now.getHours() + now.getMinutes() / 60;
  if (day === 0) return hour >= 11 && hour < 16;  // Sunday 11–4
  if (day === 6) return hour >= 9 && hour < 17;   // Saturday 9–5
  return hour >= 9 && hour < 18;                  // Weekday 9–6
}

export function MapAndHours() {
  const open = isOpenNow();

  return (
    <section className="py-20 bg-muted/10 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <ScrollReveal className="text-center mb-12">
          <p className="text-orange-600 text-sm font-bold uppercase tracking-widest mb-2">Find Us</p>
          <h2 className="text-3xl font-black mb-2">Visit Our Showroom</h2>
          <p className="text-muted-foreground text-sm">
            Columbus, Ohio&rsquo;s largest powersports showroom — over 18,000 sq ft of vehicles, parts, and gear.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
          {/* Map embed placeholder */}
          <ScrollReveal from={{ x: -30 }}>
            <div className="rounded-2xl overflow-hidden border border-border bg-muted aspect-[16/10] relative">
              <iframe
                title="Xtreme Powersports Inc. location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d96773.15491438754!2d-83.07991!3d39.9611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88388f2b4a5a1b6b%3A0x76fbcbabef22d1bc!2sColumbus%2C%20OH!5e0!3m2!1sen!2sus!4v1700000000000"
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
                  1234 Powersports Blvd, Columbus OH 43215
                </p>
                <a
                  href="https://maps.google.com/?q=1234+Powersports+Blvd+Columbus+OH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-orange-600 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <Navigation className="size-3" /> Get Directions
                  <ExternalLink className="size-2.5 ml-0.5" />
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Info panel */}
          <ScrollReveal from={{ x: 30 }}>
            <div className="space-y-5">
              {/* Open now badge */}
              <div className={cn(
                "flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold border",
                open
                  ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                  : "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
              )}>
                <span className={cn("size-2.5 rounded-full animate-pulse", open ? "bg-green-500" : "bg-red-400")} />
                {open ? "We're open right now!" : "Currently closed — see hours below"}
              </div>

              {/* Contact quick row */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Contact</h3>
                {[
                  { icon: Phone, label: "(614) 555-0199", href: "tel:+16145550199" },
                  { icon: Mail,  label: "info@xtremepowersports.com", href: "mailto:info@xtremepowersports.com" },
                  { icon: MapPin, label: "1234 Powersports Blvd, Columbus OH 43215", href: "https://maps.google.com" },
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

              <a
                href="https://maps.google.com/?q=1234+Powersports+Blvd+Columbus+OH"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition-colors"
              >
                <Navigation className="size-4" /> Get Directions
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
