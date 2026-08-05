import Link from "next/link";
import { ChevronRight, Tag, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PROMOS = [
  {
    id: 1,
    brand: "Can-Am",
    title: "Save Up to $2,000 on Select 2024 Maverick X3 Models",
    description: "Factory rebate on all 2024 Maverick X3 models in stock. Offer valid through December 31, 2024. Financing available OAC.",
    badge: "Factory Rebate",
    badgeColor: "bg-red-600",
    expires: "December 31, 2024",
    ctaHref: "/inventory?make=Can-Am&model=Maverick+X3",
    ctaLabel: "Shop Maverick X3",
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
  },
  {
    id: 4,
    brand: "Sea-Doo",
    title: "0% APR for 36 Months on 2024 Sea-Doo GTI Models",
    description: "Qualified buyers can take advantage of special factory financing at 0% APR for 36 months. Contact us for details.",
    badge: "Special Financing",
    badgeColor: "bg-teal-600",
    expires: "December 31, 2024",
    ctaHref: "/services/financing",
    ctaLabel: "Apply Now",
  },
  {
    id: 5,
    brand: "Service",
    title: "Free Winter Storage Check with Any Service Appointment",
    description: "Schedule any service before December 15 and receive a complimentary battery tender, coolant check, and storage prep — a $75 value.",
    badge: "Seasonal Offer",
    badgeColor: "bg-indigo-600",
    expires: "December 15, 2024",
    ctaHref: "/services/service-request",
    ctaLabel: "Schedule Service",
  },
  {
    id: 6,
    brand: "OEM Parts",
    title: "Free Shipping on All OEM Orders Over $75",
    description: "Order any OEM parts this month and get free standard shipping when you spend $75 or more. Use code OEMSHIP at checkout.",
    badge: "Online Only",
    badgeColor: "bg-gray-600",
    expires: "Ongoing",
    ctaHref: "/parts?type=oem",
    ctaLabel: "Shop OEM Parts",
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PROMOS.map((promo) => (
            <div key={promo.id} className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">{promo.brand}</p>
                    <h3 className="font-bold text-sm leading-snug">{promo.title}</h3>
                  </div>
                  <span className={cn("shrink-0 text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full", promo.badgeColor)}>
                    {promo.badge}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{promo.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>Expires: {promo.expires}</span>
                  </div>
                  <Link
                    href={promo.ctaHref}
                    className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline"
                  >
                    {promo.ctaLabel} <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fine print */}
        <div className="mt-10 p-5 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground leading-relaxed">
          <p className="font-semibold mb-1 flex items-center gap-1.5"><Tag className="size-3.5" />Offer Disclaimer</p>
          <p>All offers are subject to change without notice. Cannot be combined unless stated. Factory rebates subject to manufacturer eligibility requirements. Financing offers subject to credit approval. See dealer for full details. Prices plus tax, title, license & doc fee.</p>
        </div>
      </div>
    </div>
  );
}
