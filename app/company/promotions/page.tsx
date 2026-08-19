import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Clock, ArrowRight } from "lucide-react";
import { vehicleCategoryImages } from "@/data/vehicle-category-images";

const PROMOS = [
  {
    id: 1,
    brand: "Can-Am",
    title: "Save Up to $2,000 on Select 2024 Maverick X3 Models",
    description: "Factory rebate on all 2024 Maverick X3 models in stock. Offer valid through December 31, 2024.",
    badge: "Factory Rebate",
    badgeColor: "bg-red-600",
    expires: "December 31, 2024",
    ctaHref: "/inventory?make=Can-Am&model=Maverick+X3",
    ctaLabel: "Shop Maverick X3",
    image: vehicleCategoryImages.utv,
  },
  {
    id: 2,
    brand: "Polaris",
    title: "$500 Off All New Polaris RZR Trail 900 Models",
    description: "Dealer discount on all in-stock Polaris RZR Trail 900 units. Cannot be combined with other offers.",
    badge: "Dealer Special",
    badgeColor: "bg-blue-600",
    expires: "January 15, 2025",
    ctaHref: "/inventory?make=Polaris",
    ctaLabel: "Shop Polaris",
    image: vehicleCategoryImages.atv,
  },
  {
    id: 3,
    brand: "Parts & Gear",
    title: "15% Off All Troy Lee Designs Riding Gear",
    description: "Save 15% on all TLD helmets, jerseys, gloves, and boots in stock. While supplies last.",
    badge: "In-Store & Online",
    badgeColor: "bg-orange-600",
    expires: "While supplies last",
    ctaHref: "/parts?brand=Troy+Lee+Designs",
    ctaLabel: "Shop Gear",
    image: vehicleCategoryImages["dirt-bike"],
  },
  {
    id: 4,
    brand: "Trade-In",
    title: "Get Up to $2,000 More for Your Trade",
    description: "Bring in any ATV, UTV, dirt bike, watercraft or snowmobile and get top dollar toward a new unit.",
    badge: "Trade-In Bonus",
    badgeColor: "bg-teal-600",
    expires: "Ongoing",
    ctaHref: "/services/trade-in",
    ctaLabel: "Value Your Trade",
    image: vehicleCategoryImages.snowmobile,
  },
  {
    id: 5,
    brand: "OEM Parts",
    title: "Free Shipping on All OEM Orders Over $75",
    description: "Order any OEM parts this month and get free standard shipping when you spend $75 or more.",
    badge: "Online Only",
    badgeColor: "bg-gray-600",
    expires: "Ongoing",
    ctaHref: "/parts?type=oem",
    ctaLabel: "Shop OEM Parts",
    image: vehicleCategoryImages["street-bike"],
  },
  {
    id: 6,
    brand: "Personal Watercraft",
    title: "End-of-Season Watercraft Clearance",
    description: "Big savings on remaining new models while they last. Financing-free simple pricing on every unit in stock.",
    badge: "Clearance",
    badgeColor: "bg-indigo-600",
    expires: "While supplies last",
    ctaHref: "/inventory?condition=new&category=personal-watercraft",
    ctaLabel: "Shop Watercraft",
    image: vehicleCategoryImages["personal-watercraft"],
  },
];

export default function PromotionsPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Promotions</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Current Promotions & Deals</h1>
          <p className="text-muted-foreground">Factory rebates, dealer specials, and limited-time offers. Check back often — new deals added regularly.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROMOS.map((promo) => (
            <Link
              key={promo.id}
              href={promo.ctaHref}
              className="group relative rounded-2xl overflow-hidden border border-border shadow-sm transition-shadow hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] md:aspect-[4/3]">
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

                {/* Badge */}
                <span className={`absolute top-4 left-4 text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full ${promo.badgeColor}`}>
                  {promo.badge}
                </span>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[11px] font-bold text-white/80 uppercase tracking-widest mb-1">{promo.brand}</p>
                  <h3 className="text-white font-bold text-lg leading-snug line-clamp-2 mb-2">{promo.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed line-clamp-2 mb-4">{promo.description}</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-white/70">
                      <Clock className="size-3.5" /> Expires: {promo.expires}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-300 group-hover:text-orange-200">
                      {promo.ctaLabel} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Fine print */}
        <div className="mt-10 p-5 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground leading-relaxed">
          <p className="font-semibold mb-1">Offer Disclaimer</p>
          <p>All offers are subject to change without notice. Cannot be combined unless stated. Factory rebates subject to manufacturer eligibility requirements. See dealer for full details. Prices plus tax, title, license &amp; doc fee.</p>
        </div>
      </div>
    </div>
  );
}
