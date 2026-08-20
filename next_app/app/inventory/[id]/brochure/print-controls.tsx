"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

/**
 * Print controls for the brochure sheet. When `autoPrint` is set (opened via
 * the "Print Brochure" button with ?print=1), it fires window.print() on load.
 * The visible button lets the user print / save as PDF manually.
 */
export function BrochurePrintControls({ autoPrint }: { autoPrint: boolean }) {
  useEffect(() => {
    if (!autoPrint) return;
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [autoPrint]);

  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg bg-orange-600 text-white text-sm font-bold px-4 py-2.5 hover:bg-orange-700 transition-colors"
    >
      <Printer className="size-4" />
      Print / Save as PDF
    </button>
  );
}
