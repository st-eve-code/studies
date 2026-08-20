import Link from "next/link";
import { ChevronRight, Zap, Award, Users, MapPin, Phone, Clock } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const TEAM = [
  { name: "Mike Reynolds", title: "Owner / General Manager", bio: "30+ years in powersports. Former professional motocross racer turned dealer." },
  { name: "Sarah Kim", title: "Parts Manager", bio: "OEM parts specialist with 15 years of fitment expertise." },
  { name: "Jake Torres", title: "Lead Service Tech", bio: "Master-certified for Can-Am, Polaris, and Yamaha platforms." },
  { name: "Denise Hall", title: "Sales Manager", bio: "Knows the lineup inside and out and gets you on the right ride." },
];

const MILESTONES = [
  { year: "1994", event: "Founded as a single-bay repair shop in Columbus, OH" },
  { year: "2001", event: "Became authorized Can-Am dealer" },
  { year: "2006", event: "Added Polaris and Yamaha franchises" },
  { year: "2012", event: "Opened new 18,000 sq ft showroom & service center" },
  { year: "2018", event: "Launched e-commerce parts platform" },
  { year: "2024", event: "Celebrating 30 years — largest powersports dealer in Central Ohio" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">About Us</span>
          </div>
          <h1 className="text-3xl font-black mb-2">About {siteConfig.name}</h1>
          <p className="text-muted-foreground max-w-xl">Columbus Ohio's premier powersports destination since 1994.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* Hero story */}
        <section className="grid grid-cols-1 gap-10">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-10 bg-orange-600 rounded-xl flex items-center justify-center">
                <Zap className="size-6 text-white" />
              </div>
              <span className="text-orange-600 font-bold uppercase tracking-widest text-xs">Our Story</span>
            </div>
            <h2 className="text-2xl font-black">30 Years of Riding Passion</h2>
            <p className="text-muted-foreground leading-relaxed">
              What started as a one-bay repair shop in 1994 has grown into Central Ohio&rsquo;s largest powersports dealership. 
              Founded by rider Mike Reynolds, Xtreme Powersports was built on a simple idea: treat every customer like a fellow rider, not just a sale.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today we carry over 200 new and used vehicles from Can-Am, Polaris, Yamaha, Honda, Kawasaki, KTM, Sea-Doo, and more. 
              Our 18,000 sq ft showroom and 12-bay service center are staffed by enthusiasts who actually ride what they sell.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[
            { icon: Award, label: "30+", sub: "Years in business" },
            { icon: Users, label: "12,000+", sub: "Customers served" },
            { icon: Zap, label: "200+", sub: "Vehicles in stock" },
            { icon: Award, label: "10,000+", sub: "Parts SKUs" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={sub} className="text-center p-5 rounded-xl border border-border bg-card">
              <Icon className="size-6 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-black">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-2xl font-black mb-8">Our History</h2>
          <div className="space-y-4">
            {MILESTONES.map(({ year, event }) => (
              <div key={year} className="flex gap-5 items-start">
                <div className="shrink-0 w-12 text-center">
                  <span className="text-sm font-black text-orange-600">{year}</span>
                </div>
                <div className="flex-1 pb-4 border-b border-border last:border-0">
                  <p className="text-sm font-medium">{event}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section>
          <h2 className="text-2xl font-black mb-8">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map(({ name, title, bio }) => (
              <div key={name} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="aspect-square bg-orange-600/10 flex items-center justify-center">
                  <span className="text-5xl font-black text-orange-600">
                    {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-bold text-sm">{name}</p>
                  <p className="text-xs text-orange-600 font-medium mb-2">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Showroom info */}
        <section className="bg-muted/30 rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: MapPin, label: "Find Us", lines: [siteConfig.address.street, `${siteConfig.address.city}, ${siteConfig.address.state} ${siteConfig.address.zip}`] },
            { icon: Phone, label: "Contact", lines: [siteConfig.phone, siteConfig.email] },
            { icon: Clock, label: "Hours", lines: siteConfig.hours.main },
          ].map(({ icon: Icon, label, lines }) => (
            <div key={label}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="size-5 text-orange-500" />
                <span className="font-bold text-sm">{label}</span>
              </div>
              {lines.map((l) => <p key={l} className="text-sm text-muted-foreground">{l}</p>)}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
