"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
  `Hello ${siteConfig.name}! I have a question about an order.`
)}`;

export function SupportBubble() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Animate in after 1.5 s so it doesn't distract on immediate load
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3",
        "transition-all duration-500",
        "print:hidden",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      )}
      aria-label="Customer support"
    >
      {/* Expanded panel */}
      {open && (
        <div className={cn(
          "w-72 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden",
          "animate-in slide-in-from-bottom-4 fade-in-0 duration-200"
        )}>
          {/* Header */}
          <div className="bg-orange-600 px-5 py-4">
            <p className="text-white font-black text-base">Hey there! 👋</p>
            <p className="text-orange-100 text-xs mt-0.5">
              What can we help you with today?
            </p>
            {/* Live status */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="size-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-orange-100 text-[11px] font-medium">
                We usually reply in under 5 minutes
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-3 space-y-2">
            <a
              href={whatsappUrl}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white transition-all active:scale-[0.98]",
                "bg-[#25D366] hover:bg-[#1ebe5b]"
              )}
            >
              <MessageCircle className="size-5 shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-sm font-bold leading-tight">WhatsApp Us</p>
                <p className="text-xs opacity-80">Fastest reply — usually under 5 min</p>
              </div>
              <ChevronRight className="size-4 opacity-70" />
            </a>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              {siteConfig.name} · {siteConfig.region}
            </p>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        aria-expanded={open}
        className={cn(
          "relative size-14 rounded-full shadow-xl flex items-center justify-center",
          "transition-all duration-200 active:scale-95",
          open
            ? "bg-gray-800 hover:bg-gray-700 rotate-0"
            : "bg-orange-600 hover:bg-orange-700"
        )}
      >
        {/* Pulse ring when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-orange-600 animate-ping opacity-30" />
        )}

        {open ? (
          <X className="size-6 text-white" />
        ) : (
          <MessageCircle className="size-6 text-white" />
        )}
      </button>

      {/* Tooltip label when closed */}
      {!open && visible && (
        <div className="absolute right-16 bottom-3 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap pointer-events-none animate-in fade-in-0 slide-in-from-right-2 duration-300">
          Need help? Chat with us!
        </div>
      )}
    </div>
  );
}
