"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageCircle, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildOrderRef,
  buildReceipt,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/receipt";
import type { CartItem, CartTotals, ShippingMethod } from "@/types/cart";

interface OrderReceiptProps {
  items: CartItem[];
  totals: CartTotals;
  shippingMethod: ShippingMethod;
  orderRef?: string;
  notes?: string;
  compact?: boolean;
}

export function OrderReceipt({
  items,
  totals,
  shippingMethod,
  orderRef,
  notes,
  compact,
}: OrderReceiptProps) {
  const [ref] = useState(() => orderRef ?? buildOrderRef());
  const [copied, setCopied] = useState(false);

  const receipt = useMemo(
    () => buildReceipt({ items, totals, shippingMethod, orderRef: ref, notes }),
    [items, totals, shippingMethod, ref, notes]
  );

  const whatsAppUrl = useMemo(
    () => buildWhatsAppUrl(buildWhatsAppMessage({ items, totals, shippingMethod, orderRef: ref, notes })),
    [items, totals, shippingMethod, ref, notes]
  );

  const copyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(receipt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = receipt;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-muted/40 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-black text-sm">Order Receipt</p>
          <p className="text-xs text-muted-foreground">
            Ref: <span className="font-mono font-semibold text-foreground">{ref}</span> · {items.length}{" "}
            {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/40 rounded-full px-3 py-1">
          <Save className="size-3" /> Saved until you remove it
        </span>
      </div>

      {/* Receipt preview */}
      <pre className={cn(
        "overflow-x-auto font-mono text-xs leading-relaxed text-foreground whitespace-pre bg-background",
        compact ? "max-h-64 p-4" : "max-h-80 p-5"
      )}>
        {receipt}
      </pre>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-border flex flex-col sm:flex-row gap-3">
        <button
          onClick={copyReceipt}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-colors"
        >
          {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
          {copied ? "Receipt Copied!" : "Copy Receipt"}
        </button>
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5b] text-white font-bold text-sm transition-colors"
        >
          <MessageCircle className="size-4" /> Complete Order via WhatsApp
        </a>
      </div>

      <p className="px-5 pb-4 -mt-1 text-[11px] text-muted-foreground">
        We never collect payment on this website. Send this receipt to us on WhatsApp
        and we&rsquo;ll confirm availability, final price, and next steps together.
      </p>
    </div>
  );
}
