import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, Mail } from "lucide-react";

// ── Social platform SVG icons (inline — no external icon dep needed) ─────────
function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.932-1.956 1.888v2.266h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}
function IconYouTube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  );
}
function IconTikTok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.54V6.79a4.84 4.84 0 01-1.02-.1z"/>
    </svg>
  );
}
function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

const footerLinks = {
  Inventory: [
    { label: "ATVs", href: "/inventory?category=atv" },
    { label: "UTVs / Side-by-Sides", href: "/inventory?category=utv" },
    { label: "Dirt Bikes", href: "/inventory?category=dirt-bike" },
    { label: "Personal Watercraft", href: "/inventory?category=personal-watercraft" },
    { label: "Snowmobiles", href: "/inventory?category=snowmobile" },
    { label: "Used Vehicles", href: "/inventory?condition=used" },
  ],
  "Parts & Gear": [
    { label: "OEM Parts", href: "/parts?type=oem" },
    { label: "Aftermarket", href: "/parts?type=aftermarket" },
    { label: "Performance", href: "/parts?type=performance" },
    { label: "Riding Gear", href: "/parts?category=riding-gear" },
    { label: "Tires & Wheels", href: "/parts?category=tires-wheels" },
    { label: "OEM Microfiche", href: "/parts/microfiche" },
  ],
  Services: [
    { label: "Financing", href: "/services/financing" },
    { label: "Service & Repair", href: "/services/service-request" },
    { label: "Trade-In Valuation", href: "/services/trade-in" },
    { label: "Promotions", href: "/company/promotions" },
  ],
  Company: [
    { label: "About Us", href: "/company/about" },
    { label: "Contact", href: "/company/contact" },
    { label: "Privacy Policy", href: "/company/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 mt-auto print:hidden">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="Xtreme Powersports Inc."
                width={192}
                height={56}
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Columbus, Ohio&rsquo;s premier destination for ATVs, UTVs, dirt bikes, watercraft,
              and all the parts & gear to keep you riding.
            </p>
            <div className="space-y-2 text-sm">
              <a href="tel:+16145550199" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                <Phone className="size-4 text-orange-500" />
                (614) 555-0199
              </a>
              <a href="mailto:info@xtremepowersports.com" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                <Mail className="size-4 text-orange-500" />
                info@xtremepowersports.com
              </a>
              <span className="flex items-start gap-2">
                <MapPin className="size-4 text-orange-500 mt-0.5 shrink-0" />
                1234 Powersports Blvd<br />Columbus, OH 43215
              </span>
            </div>
            {/* Social icons */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-5 mb-3">
              Follow Us
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { Icon: IconFacebook,  href: "https://www.facebook.com/xtremepowersports",   label: "Facebook",    bg: "hover:bg-[#1877F2]" },
                { Icon: IconInstagram, href: "https://www.instagram.com/xtremepowersports",  label: "Instagram",   bg: "hover:bg-pink-600" },
                { Icon: IconYouTube,   href: "https://www.youtube.com/@xtremepowersports",   label: "YouTube",     bg: "hover:bg-[#FF0000]" },
                { Icon: IconTikTok,    href: "https://www.tiktok.com/@xtremepowersports",    label: "TikTok",      bg: "hover:bg-neutral-800" },
                { Icon: IconX,         href: "https://x.com/xtremepwrsports",                label: "X / Twitter", bg: "hover:bg-black" },
              ].map(({ Icon, href, label, bg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center ${bg} hover:border-transparent hover:scale-110 transition-all duration-200`}
                >
                  <Icon className="size-[18px] text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Hours */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div>
              <span className="text-white font-medium">Showroom Hours</span>
              <p>Mon–Fri: 9:00 AM – 6:00 PM</p>
              <p>Saturday: 9:00 AM – 5:00 PM</p>
              <p>Sunday: 11:00 AM – 4:00 PM</p>
            </div>
            <div>
              <span className="text-white font-medium">Service Department</span>
              <p>Mon–Fri: 8:00 AM – 5:30 PM</p>
              <p>Saturday: 9:00 AM – 3:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
            <div>
              <span className="text-white font-medium">Parts Department</span>
              <p>Mon–Sat: 8:00 AM – 6:00 PM</p>
              <p>Sunday: 11:00 AM – 4:00 PM</p>
              <p>Online orders: 24/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Xtreme Powersports Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/company/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/company/terms" className="hover:text-gray-300 transition-colors">Terms of Service & Copyright</Link>
            <span>Dealer License #OH-2024-PSP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
