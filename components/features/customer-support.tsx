"use client";

import Link from "next/link";
import {
  ArrowRight,
  DollarSign,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const quickLinks = [
  { icon: DollarSign, label: "Apply for Financing", href: "/services/financing", accent: "text-orange-500" },
  { icon: ArrowRight, label: "Value Your Trade-In", href: "/services/trade-in", accent: "text-orange-500" },
  { icon: ArrowRight, label: "Current Promotions", href: "/company/promotions", accent: "text-orange-500" },
  { icon: ArrowRight, label: "Order OEM Parts", href: "/parts?type=oem", accent: "text-orange-500" },
  { icon: ArrowRight, label: "Browse New Inventory", href: "/inventory?condition=new", accent: "text-orange-500" },
  { icon: ArrowRight, label: "FAQ & Support Docs", href: "/company/contact", accent: "text-orange-500" },
];

export function CustomerSupport() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl font-black mb-3">World-Class Customer Support</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Whether you&rsquo;re buying your first ATV or need urgent parts for the weekend race,
            our expert team is ready to help every step of the way.
          </p>
        </ScrollReveal>

        {/* Quick links + hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick links */}
          <ScrollReveal from={{ x: -30 }}>
            <div className="rounded-2xl border border-border bg-card p-7">
              <h3 className="font-black text-lg mb-5 flex items-center gap-2">
                <span className="size-2 rounded-full bg-orange-600 inline-block" />
                Quick Links
              </h3>
              <ul className="space-y-2">
                {quickLinks.map(({ label, href, accent }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors group"
                    >
                      <ArrowRight className={`size-4 ${accent} group-hover:translate-x-0.5 transition-transform`} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Support promise */}
          <ScrollReveal from={{ x: 30 }}>
            <div className="rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 p-7 text-white h-full flex flex-col justify-between">
              <div>
                <h3 className="font-black text-xl mb-3">Our Support Promise</h3>
                <p className="text-orange-100 text-sm leading-relaxed mb-6">
                  Every customer gets the same treatment whether you&rsquo;re spending $50 on a filter or
                  $35,000 on a new UTV. Real people, real answers, real fast.
                </p>
                <ul className="space-y-3">
                  {[
                    "Expert staff who actually ride",
                    "Honest advice — no upselling",
                    "Price match on parts & accessories",
                    "Free installation advice",
                    "Lifetime service relationship",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm">
                      <span className="size-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-[10px] font-black">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/company/contact"
                className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-600 font-bold text-sm hover:bg-orange-50 transition-colors w-fit"
              >
                Contact Support <ArrowRight className="size-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
