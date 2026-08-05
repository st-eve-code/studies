"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X, Maximize2, Camera, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal, StaggerReveal } from "@/components/ui/scroll-reveal";

const tourSpots = [
  {
    id: "showroom",
    label: "Main Showroom",
    description: "18,000 sq ft of new & pre-owned vehicles on display — ATVs, UTVs, dirt bikes and more.",
    image: "https://picsum.photos/seed/tour-showroom/1200/700",
    thumb: "https://picsum.photos/seed/tour-showroom/300/200",
  },
  {
    id: "parts",
    label: "Parts Department",
    description: "Over 10,000 OEM & aftermarket SKUs in stock. Our parts team will find exactly what you need.",
    image: "https://picsum.photos/seed/tour-parts/1200/700",
    thumb: "https://picsum.photos/seed/tour-parts/300/200",
  },
  {
    id: "service",
    label: "Service Bay",
    description: "12 fully-equipped service bays staffed by factory-certified technicians.",
    image: "https://picsum.photos/seed/tour-service/1200/700",
    thumb: "https://picsum.photos/seed/tour-service/300/200",
  },
  {
    id: "gear",
    label: "Riding Gear Wall",
    description: "Full collection of helmets, boots, jerseys and protection gear from TLD, Alpinestars, Fox & more.",
    image: "https://picsum.photos/seed/tour-gear/1200/700",
    thumb: "https://picsum.photos/seed/tour-gear/300/200",
  },
  {
    id: "watercraft",
    label: "Watercraft Section",
    description: "Year-round Sea-Doo and Kawasaki personal watercraft, plus on-the-water accessories.",
    image: "https://picsum.photos/seed/tour-watercraft/1200/700",
    thumb: "https://picsum.photos/seed/tour-watercraft/300/200",
  },
  {
    id: "lounge",
    label: "Customer Lounge",
    description: "Relax while our team finalises your paperwork — coffee, WiFi, and a big-screen viewing area.",
    image: "https://picsum.photos/seed/tour-lounge/1200/700",
    thumb: "https://picsum.photos/seed/tour-lounge/300/200",
  },
];

export function VirtualTour() {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const spot = tourSpots[active];
  const prev = () => setActive((a) => (a - 1 + tourSpots.length) % tourSpots.length);
  const next = () => setActive((a) => (a + 1) % tourSpots.length);

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <ScrollReveal className="text-center mb-12">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-orange-600/10 mb-4">
            <Camera className="size-7 text-orange-600" />
          </div>
          <p className="text-orange-600 text-sm font-bold uppercase tracking-widest mb-2">Step Inside</p>
          <h2 className="text-3xl font-black mb-3">Virtual Store Tour</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Can&rsquo;t make it in today? Take a guided photo tour of our 18,000 sq ft facility from the comfort of your screen.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main viewer */}
          <ScrollReveal from={{ y: 24 }}>
            <div className="relative rounded-2xl overflow-hidden border border-border bg-muted aspect-video group">
              <Image
                src={spot.image}
                alt={spot.label}
                fill
                className="object-cover transition-opacity duration-500"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="size-2 rounded-full bg-orange-500" />
                  <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Now Viewing</span>
                </div>
                <h3 className="text-white text-xl font-black">{spot.label}</h3>
                <p className="text-white/70 text-sm mt-1">{spot.description}</p>
              </div>

              {/* Lightbox button */}
              <button
                onClick={() => setLightboxOpen(true)}
                aria-label="Open fullscreen"
                className="absolute top-4 right-4 size-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              >
                <Maximize2 className="size-4" />
              </button>

              {/* Prev / Next arrows */}
              <button onClick={prev} aria-label="Previous spot"
                className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                <ChevronLeft className="size-5" />
              </button>
              <button onClick={next} aria-label="Next spot"
                className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                <ChevronRight className="size-5" />
              </button>

              {/* Counter */}
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {active + 1} / {tourSpots.length}
              </div>
            </div>
          </ScrollReveal>

          {/* Thumbnail sidebar */}
          <StaggerReveal stagger={0.07} from={{ x: 20 }} duration={0.45} className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[360px] pb-2 lg:pb-0">
            {tourSpots.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className={cn(
                  "relative shrink-0 w-28 lg:w-full rounded-xl overflow-hidden border-2 transition-all",
                  i === active ? "border-orange-500 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={s.thumb}
                  alt={s.label}
                  width={300}
                  height={200}
                  className="w-full aspect-[3/2] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <p className="absolute bottom-1.5 left-2 right-2 text-white text-[10px] font-bold leading-tight">{s.label}</p>
              </button>
            ))}
          </StaggerReveal>
        </div>

        {/* Book a real visit CTA */}
        <ScrollReveal className="mt-10 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-orange-600 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="size-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-lg">See It In Person</h3>
              <p className="text-gray-400 text-sm">Nothing beats sitting in the seat. Come test ride your next machine today.</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a href="tel:+16145550199"
              className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition-colors whitespace-nowrap">
              Call to Visit
            </a>
            <a href="/company/contact"
              className="px-5 py-2.5 rounded-xl border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition-colors whitespace-nowrap">
              Get Directions
            </a>
          </div>
        </ScrollReveal>
      </div>

      {/* Fullscreen lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white" aria-label="Close">
            <X className="size-5" />
          </button>
          <div className="relative w-full max-w-5xl aspect-video">
            <Image src={spot.image} alt={spot.label} fill className="object-contain" sizes="100vw" priority />
          </div>
          <p className="absolute bottom-6 text-white font-bold text-lg">{spot.label}</p>
        </div>
      )}
    </section>
  );
}
