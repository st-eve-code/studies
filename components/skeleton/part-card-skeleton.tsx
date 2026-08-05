import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function PartCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <Bone className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-2 flex-1">
        <Bone className="h-3 w-1/4" />
        <Bone className="h-5 w-3/4" />
        <Bone className="h-3 w-1/2" />
        <div className="flex gap-1 pt-1">
          <Bone className="h-3 w-8" />
          <Bone className="h-3 w-8" />
          <Bone className="h-3 w-8" />
          <Bone className="h-3 w-8" />
          <Bone className="h-3 w-8" />
        </div>
        <div className="flex justify-between items-center pt-3">
          <Bone className="h-6 w-16" />
          <Bone className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function PartGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <PartCardSkeleton key={i} />
      ))}
    </div>
  );
}
