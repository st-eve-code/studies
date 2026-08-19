import { Phone, MapPin, Clock, Truck } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function AnnouncementBar() {
  return (
    <div className="bg-zinc-950 text-zinc-400 text-xs border-b border-white/10 print:hidden">
      <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between">
        {/* Left — contact info */}
        <div className="hidden md:flex items-center gap-5">
          <a
            href={`tel:${siteConfig.phoneTel}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="size-3" />
            <span>{siteConfig.phone}</span>
          </a>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3" />
            <span>{siteConfig.address.line}</span>
          </span>
        </div>

        {/* Center — promo strip */}
        <p className="flex-1 text-center font-medium tracking-wide flex items-center justify-center gap-1.5 text-white">
          <Truck className="size-3.5 shrink-0" aria-hidden="true" />
          <span>Free Shipping on Orders Over $150</span>
          <span className="hidden sm:inline text-zinc-500" aria-hidden="true">·</span>
          <span className="hidden sm:inline text-zinc-400">No-Haggle Pricing</span>
        </p>

        {/* Right — hours */}
        <div className="hidden md:flex items-center gap-1.5">
          <Clock className="size-3" />
          <span>{siteConfig.hours.announcement}</span>
        </div>
      </div>
    </div>
  );
}
