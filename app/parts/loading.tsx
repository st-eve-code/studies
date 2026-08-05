import { PartGridSkeleton } from "@/components/skeleton/part-card-skeleton";
import { PageHeaderSkeleton } from "@/components/skeleton/page-skeleton";

export default function PartsLoading() {
  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <PageHeaderSkeleton />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <PartGridSkeleton count={8} />
      </div>
    </div>
  );
}
