import { VehicleGridSkeleton } from "@/components/skeleton/vehicle-card-skeleton";
import { SidebarFilterSkeleton, PageHeaderSkeleton } from "@/components/skeleton/page-skeleton";

export default function InventoryLoading() {
  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <PageHeaderSkeleton />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-64 shrink-0">
            <SidebarFilterSkeleton />
          </div>
          <div className="flex-1">
            <VehicleGridSkeleton count={6} />
          </div>
        </div>
      </div>
    </div>
  );
}
