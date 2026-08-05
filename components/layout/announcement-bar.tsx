import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-orange-600 text-white text-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between">
        {/* Left — contact info */}
        <div className="hidden md:flex items-center gap-5">
          <a
            href="tel:+16145550199"
            className="flex items-center gap-1.5 hover:text-orange-100 transition-colors"
          >
            <Phone className="size-3" />
            <span>(614) 555-0199</span>
          </a>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3" />
            <span>1234 Powersports Blvd, Columbus, OH 43215</span>
          </span>
        </div>

        {/* Center — promo strip */}
        <p className="flex-1 text-center font-medium tracking-wide">
          🏁&nbsp; Free Shipping on Orders Over $150 &nbsp;·&nbsp; Financing Available OAC
        </p>

        {/* Right — hours */}
        <div className="hidden md:flex items-center gap-1.5">
          <Clock className="size-3" />
          <span>Mon–Sat 9am–6pm&nbsp;|&nbsp;Sun 11am–4pm</span>
        </div>
      </div>
    </div>
  );
}
