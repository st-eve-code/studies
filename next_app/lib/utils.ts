import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as USD currency */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a number with commas */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** Calculate monthly payment estimate */
export function calcMonthlyPayment(
  price: number,
  downPayment: number,
  apr: number,
  termMonths: number
): number {
  const principal = price - downPayment;
  if (principal <= 0) return 0;
  const monthlyRate = apr / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)
  );
}

/** Estimate shipping cost based on subtotal */
export function calcShipping(subtotal: number, method: string): number {
  if (method === "pickup") return 0;
  if (subtotal >= 150) return 0; // free shipping threshold
  switch (method) {
    case "standard":
      return 9.99;
    case "expedited":
      return 24.99;
    case "overnight":
      return 49.99;
    default:
      return 9.99;
  }
}

/** Calculate tax */
export function calcTax(subtotal: number, taxRate = 0.0775): number {
  return subtotal * taxRate;
}

/** Truncate text to a max length */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

/** Slugify a string for URL-safe IDs */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Capitalize first letter of each word */
export function titleCase(text: string): string {
  return text.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Get savings amount and percent */
export function getSavings(price: number, msrp: number): { amount: number; percent: number } {
  const amount = msrp - price;
  const percent = Math.round((amount / msrp) * 100);
  return { amount, percent };
}

/** Star rating helper — returns array of 5 for rendering */
export function getStarArray(rating: number): Array<"full" | "half" | "empty"> {
  return Array.from({ length: 5 }, (_, i) => {
    if (rating >= i + 1) return "full";
    if (rating >= i + 0.5) return "half";
    return "empty";
  });
}
