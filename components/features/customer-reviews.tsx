"use client";

import { useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal, StaggerReveal } from "@/components/ui/scroll-reveal";

const reviews = [
  {
    id: 1,
    name: "Marcus T.",
    location: "Columbus, OH",
    avatar: "https://picsum.photos/seed/rev1/80/80",
    rating: 5,
    date: "November 2024",
    vehicle: "2024 Can-Am Maverick X3 X RS",
    title: "Best dealership experience I've ever had",
    body: "I've bought vehicles from six different dealers over the years and Xtreme Powersports blows them all away. The sales team knew every spec on the Maverick X3 before I even asked. No pressure, no games, just honest info. Drove home the same day.",
    source: "Google",
  },
  {
    id: 2,
    name: "Brittany & Josh K.",
    location: "Westerville, OH",
    avatar: "https://picsum.photos/seed/rev2/80/80",
    rating: 5,
    date: "October 2024",
    vehicle: "2024 Polaris RZR Pro R",
    title: "Amazing from start to finish",
    body: "We did a lot of research and visited three dealers before coming here. The difference was night and day. They actually took us out for a demo ride, explained the financing options clearly, and the paperwork took less than 30 minutes. Love our new RZR.",
    source: "Google",
  },
  {
    id: 3,
    name: "Derek M.",
    location: "Dublin, OH",
    avatar: "https://picsum.photos/seed/rev3/80/80",
    rating: 5,
    date: "October 2024",
    vehicle: "Parts Order — Fox Shocks",
    title: "Parts department is top notch",
    body: "Ordered a full set of Fox shocks and needed to confirm fitment on my 2022 RZR XP 1000. The parts team called me back within an hour with the exact part numbers. Shipped the same day and arrived two days later. Will not go anywhere else for parts.",
    source: "Yelp",
  },
  {
    id: 4,
    name: "Sandra L.",
    location: "Powell, OH",
    avatar: "https://picsum.photos/seed/rev4/80/80",
    rating: 5,
    date: "September 2024",
    vehicle: "2024 Sea-Doo RXP-X 325",
    title: "First watercraft — couldn't have been easier",
    body: "I was nervous buying my first personal watercraft and had zero idea where to start. The team here were so patient. They walked me through every model, helped me understand the insurance requirements, and even recommended a local instructor. 11/10.",
    source: "Google",
  },
  {
    id: 5,
    name: "Antonio R.",
    location: "Hilliard, OH",
    avatar: "https://picsum.photos/seed/rev5/80/80",
    rating: 5,
    date: "August 2024",
    vehicle: "Service Department",
    title: "Fastest service turnaround in town",
    body: "Brought in my 2021 Yamaha Grizzly for a full service and belt replacement. Was told 3 days, picked it up in 2. Jake in the service bay explained everything they did and even flagged a small issue with the front CV boot before it became a problem. Lifesavers.",
    source: "Google",
  },
  {
    id: 6,
    name: "Ryan & Chloe W.",
    location: "Gahanna, OH",
    avatar: "https://picsum.photos/seed/rev6/80/80",
    rating: 5,
    date: "July 2024",
    vehicle: "2024 Yamaha YZ450F",
    title: "Trade-in was fair and quick",
    body: "Traded in our old KTM and bought a YZ450F. The trade value they offered was $800 more than two other dealers. Everything was transparent — no hidden fees, no surprise charges at signing. Just a straight forward deal.",
    source: "Facebook",
  },
];

const summaryStats = [
  { value: "4.9", label: "Average Rating", sub: "Across 1,200+ reviews" },
  { value: "98%", label: "Would Recommend", sub: "Based on customer surveys" },
  { value: "12k+", label: "Happy Customers", sub: "Since 1994" },
  { value: "#1", label: "In Central Ohio", sub: "Powersports dealer" },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  );
}

const SOURCE_COLORS: Record<string, string> = {
  Google: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  Yelp: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  Facebook: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
};

export function CustomerReviews() {
  const [active, setActive] = useState(0);
  const total = reviews.length;
  const prev = () => setActive((a) => (a - 1 + total) % total);
  const next = () => setActive((a) => (a + 1) % total);

  const featured = reviews[active];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <ScrollReveal className="text-center mb-12">
          <p className="text-orange-600 text-sm font-bold uppercase tracking-widest mb-2">
            Real People, Real Rides
          </p>
          <h2 className="text-3xl font-black mb-3">What Our Customers Say</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Don&rsquo;t take our word for it — here&rsquo;s what riders across Central Ohio think.
          </p>
        </ScrollReveal>

        {/* Summary stats */}
        <StaggerReveal
          stagger={0.08}
          from={{ y: 20 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14"
        >
          {summaryStats.map(({ value, label, sub }) => (
            <div key={label} className="text-center p-5 rounded-2xl border border-border bg-card">
              <p className="text-4xl font-black text-orange-600 mb-1">{value}</p>
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          ))}
        </StaggerReveal>

        {/* Featured review carousel */}
        <ScrollReveal className="mb-10">
          <div className="relative rounded-2xl border border-border bg-card p-8 md:p-10 overflow-hidden">
            {/* Big quote mark */}
            <Quote className="absolute top-6 right-8 size-24 text-muted/30 rotate-180" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
              {/* Avatar + meta */}
              <div className="flex flex-col items-center text-center gap-2 min-w-[120px]">
                <img
                  src={featured.avatar}
                  alt={featured.name}
                  className="size-16 rounded-full object-cover border-2 border-orange-500"
                />
                <p className="font-bold text-sm">{featured.name}</p>
                <p className="text-xs text-muted-foreground">{featured.location}</p>
                <StarRow rating={featured.rating} />
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full mt-1", SOURCE_COLORS[featured.source] ?? "bg-muted text-muted-foreground")}>
                  {featured.source}
                </span>
              </div>

              {/* Review text */}
              <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-2.5 py-0.5 rounded-full">
                    {featured.vehicle}
                  </span>
                  <span className="text-xs text-muted-foreground">{featured.date}</span>
                </div>
                <h3 className="text-xl font-black mb-3">&ldquo;{featured.title}&rdquo;</h3>
                <p className="text-foreground/80 leading-relaxed text-sm">{featured.body}</p>
              </div>
            </div>

            {/* Carousel controls */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <div className="flex gap-1.5">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    aria-label={`Review ${i + 1}`}
                    className={cn(
                      "transition-all rounded-full",
                      i === active ? "w-6 h-2 bg-orange-500" : "size-2 bg-border hover:bg-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prev}
                  aria-label="Previous review"
                  className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-orange-400 transition-colors"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={next}
                  aria-label="Next review"
                  className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-orange-400 transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Review grid — remaining reviews */}
        <StaggerReveal
          stagger={0.08}
          from={{ y: 28 }}
          duration={0.5}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {reviews.map((r) => (
            <div key={r.id} className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <img src={r.avatar} alt={r.name} className="size-9 rounded-full object-cover shrink-0" />
                  <div>
                    <p className="text-sm font-bold leading-tight">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.location}</p>
                  </div>
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", SOURCE_COLORS[r.source] ?? "bg-muted text-muted-foreground")}>
                  {r.source}
                </span>
              </div>
              <StarRow rating={r.rating} />
              <p className="text-xs font-semibold text-orange-600 mt-2 mb-1">{r.vehicle}</p>
              <p className="text-sm font-bold mb-1">&ldquo;{r.title}&rdquo;</p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{r.body}</p>
            </div>
          ))}
        </StaggerReveal>

        {/* External review link */}
        <ScrollReveal className="mt-8 text-center">
          <a
            href="https://www.google.com/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-orange-600 transition-colors"
          >
            <ExternalLink className="size-4" />
            See all 1,200+ reviews on Google
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
