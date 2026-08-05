"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center px-4">
      <div className="size-16 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center">
        <AlertTriangle className="size-8 text-red-500" />
      </div>
      <div>
        <h1 className="text-2xl font-black mb-2">Something went wrong</h1>
        <p className="text-muted-foreground max-w-sm">
          We hit an unexpected error. You can try refreshing or head back to the homepage.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mt-2 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors"
        >
          <RefreshCw className="size-4" /> Try Again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border font-bold hover:bg-muted transition-colors"
        >
          <Home className="size-4" /> Home
        </Link>
      </div>
    </div>
  );
}
