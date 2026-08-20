import type { CartItem, CartTotals, ShippingMethod } from "@/types/cart";
import { formatCurrency } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

export const SHIPPING_LABELS: Record<ShippingMethod, string> = {
  pickup: "In-Store Pickup (Free)",
  standard: "Standard Shipping (USPS/UPS Ground)",
  expedited: "Expedited Shipping (UPS 2-Day)",
  overnight: "Overnight Shipping (UPS Next Day Air)",
};

export function buildOrderRef(): string {
  return `XPS-${Date.now().toString(36).toUpperCase()}`;
}

export function whatsappDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function buildWhatsAppUrl(
  message: string,
  phone: string = siteConfig.whatsapp
): string {
  return `https://wa.me/${whatsappDigits(phone)}?text=${encodeURIComponent(message)}`;
}

export interface ReceiptInput {
  items: CartItem[];
  totals: CartTotals;
  shippingMethod: ShippingMethod;
  orderRef: string;
  notes?: string;
}

const SEP = "=".repeat(42);
const THIN = "-".repeat(42);

function align(label: string, value: string): string {
  const pad = 42 - label.length;
  return `${label}${" ".repeat(Math.max(1, pad))}${value}`;
}

export function buildReceipt({
  items,
  totals,
  shippingMethod,
  orderRef,
  notes,
}: ReceiptInput): string {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const rows: string[] = [];
  rows.push(SEP);
  rows.push(`  ${siteConfig.name.toUpperCase()}  ORDER INQUIRY`);
  rows.push(SEP);
  rows.push(`Order Ref: ${orderRef}`);
  rows.push(`Date: ${date}`);
  rows.push("");
  rows.push("ITEMS");
  rows.push(THIN);

  for (const item of items) {
    const ref = item.sku ? `[${item.sku}] ` : "";
    rows.push(`${item.quantity} x ${ref}${item.name}`);
    if (item.brand) rows.push(`     Brand: ${item.brand}`);
    rows.push(
      align(
        `     @ ${formatCurrency(item.price)} each`,
        formatCurrency(item.price * item.quantity)
      )
    );
    rows.push("");
  }

  rows.push(THIN);
  rows.push(align("Subtotal", formatCurrency(totals.subtotal)));
  if (totals.discount > 0) {
    rows.push(align("Discount", `-${formatCurrency(totals.discount)}`));
  }
  const shipping =
    totals.shippingEstimate === 0
      ? "FREE"
      : formatCurrency(totals.shippingEstimate);
  rows.push(align(`Shipping (${SHIPPING_LABELS[shippingMethod]})`, shipping));
  rows.push(
    align(`Tax (${(totals.taxRate * 100).toFixed(2)}%)`, formatCurrency(totals.tax))
  );
  rows.push(SEP);
  rows.push(align("TOTAL", formatCurrency(totals.total)));
  rows.push(SEP);
  rows.push(`Delivery: ${SHIPPING_LABELS[shippingMethod]}`);
  if (notes && notes.trim()) rows.push(`Notes: ${notes.trim()}`);
  rows.push("");
  rows.push(`Questions? Contact ${siteConfig.name}`);
  rows.push(`${siteConfig.phone}  |  ${siteConfig.email}`);
  rows.push(`${siteConfig.address.line}`);

  return rows.join("\n");
}

export function buildWhatsAppMessage(input: ReceiptInput): string {
  const receipt = buildReceipt(input);
  return [
    `Hello ${siteConfig.name}!`,
    "",
    "I would like to order the following items:",
    "",
    "```",
    receipt,
    "```",
    "",
    "Please confirm availability, final price, and next steps. Thank you!",
  ].join("\n");
}
