import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function VehicleDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Bone className="h-4 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Bone className="h-80 w-full rounded-xl" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bone key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Bone className="h-4 w-1/4" />
          <Bone className="h-8 w-3/4" />
          <Bone className="h-10 w-1/3" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-5/6" />
          <Bone className="h-4 w-4/6" />
          <Bone className="h-12 w-full rounded-xl" />
          <Bone className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3 py-6">
      <Bone className="h-8 w-56" />
      <Bone className="h-4 w-96" />
    </div>
  );
}

export function SidebarFilterSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Bone className="h-5 w-24" />
          {Array.from({ length: 4 }).map((_, j) => (
            <Bone key={j} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
