import Link from "next/link";
import { SearchX, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center px-4">
      <div className="size-20 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center">
        <SearchX className="size-10 text-orange-500" />
      </div>
      <div>
        <p className="text-6xl font-black text-orange-600 mb-2">404</p>
        <h1 className="text-2xl font-black mb-2">Page Not Found</h1>
        <p className="text-muted-foreground max-w-sm">
          That page doesn&rsquo;t exist or may have moved. Try browsing our inventory or searching for what you need.
        </p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors"
        >
          <Home className="size-4" /> Back to Home
        </Link>
        <Link
          href="/inventory"
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border font-bold hover:bg-muted transition-colors"
        >
          Browse Inventory
        </Link>
      </div>
    </div>
  );
}
