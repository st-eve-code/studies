import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal, StaggerReveal } from "@/components/ui/scroll-reveal";

const reviews = [
  {
    id: 1,
    name: "Marcus T.",
    location: "Columbus, OH",
    rating: 5,
    vehicle: "2024 Can-Am Maverick X3 X RS",
    title: "Best dealership experience I've ever had",
    body: "I've bought vehicles from six different dealers over the years and Xtreme Powersports blows them all away. The sales team knew every spec on the Maverick X3 before I even asked. No pressure, no games, just honest info. Drove home the same day.",
  },
  {
    id: 2,
    name: "Brittany & Josh K.",
    location: "Westerville, OH",
    rating: 5,
    vehicle: "2024 Polaris RZR Pro R",
    title: "Amazing from start to finish",
    body: "We did a lot of research and visited three dealers before coming here. The difference was night and day. They actually took us out for a demo ride, walked us through every option, and the paperwork took less than 30 minutes. Love our new RZR.",
  },
  {
    id: 3,
    name: "Derek M.",
    location: "Dublin, OH",
    rating: 5,
    vehicle: "Parts Order — Fox Shocks",
    title: "Parts department is top notch",
    body: "Ordered a full set of Fox shocks and needed to confirm fitment on my 2022 RZR XP 1000. The parts team called me back within an hour with the exact part numbers. Shipped the same day and arrived two days later. Will not go anywhere else for parts.",
  },
  {
    id: 4,
    name: "Sandra L.",
    location: "Powell, OH",
    rating: 5,
    vehicle: "2024 Sea-Doo RXP-X 325",
    title: "First watercraft — couldn't have been easier",
    body: "I was nervous buying my first personal watercraft and had zero idea where to start. The team here were so patient. They walked me through every model, helped me understand the insurance requirements, and even recommended a local instructor. 11/10.",
  },
  {
    id: 5,
    name: "Antonio R.",
    location: "Hilliard, OH",
    rating: 5,
    vehicle: "Service Department",
    title: "Fastest service turnaround in town",
    body: "Brought in my 2021 Yamaha Grizzly for a full service and belt replacement. Was told 3 days, picked it up in 2. Jake in the service bay explained everything they did and even flagged a small issue with the front CV boot before it became a problem. Lifesavers.",
  },
  {
    id: 6,
    name: "Ryan & Chloe W.",
    location: "Gahanna, OH",
    rating: 5,
    vehicle: "2024 Yamaha YZ450F",
    title: "Trade-in was fair and quick",
    body: "Traded in our old KTM and bought a YZ450F. The trade value they offered was $800 more than two other dealers. Everything was transparent — no hidden fees, no surprise charges at signing. Just a straight forward deal.",
  },
];

const summaryStats = [
  { value: "4.9", label: "Average Rating" },
  { value: "98%", label: "Would Recommend" },
  { value: "12k+", label: "Happy Customers" },
  { value: "#1", label: "In Central Ohio" },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
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

export function CustomerReviews() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl font-black">What Our Customers Say</h2>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border-y border-border mb-14">
          {summaryStats.map(({ value, label }) => (
            <div key={label} className="bg-background py-5 px-4 text-center">
              <p className="text-3xl font-black">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <StaggerReveal
          stagger={0.06}
          from={{ y: 24 }}
          duration={0.5}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border"
        >
          {reviews.map((r) => (
            <article key={r.id} className="bg-background p-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-bold leading-tight">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.location}</p>
                </div>
                <StarRow rating={r.rating} />
              </div>
              <p className="text-xs font-semibold text-orange-600 mb-1">{r.vehicle}</p>
              <h3 className="text-sm font-bold mb-1.5">&ldquo;{r.title}&rdquo;</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{r.body}</p>
            </article>
          ))}
        </StaggerReveal>

      </div>
    </section>
  );
}
