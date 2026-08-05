import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Bone className="h-52 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Bone className="h-4 w-1/3" />
        <Bone className="h-6 w-2/3" />
        <Bone className="h-4 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Bone className="h-4 w-16" />
          <Bone className="h-4 w-16" />
          <Bone className="h-4 w-16" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Bone className="h-7 w-24" />
          <Bone className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function VehicleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </div>
  );
}
