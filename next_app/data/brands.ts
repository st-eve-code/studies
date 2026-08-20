import type { StaticImageData } from "next/image";
import canAmMark from "@/components/logo/marks/extremecolumbus-brand-can-am.png";
import polarisMark from "@/components/logo/marks/extremecolumbus-brand-polaris.png";
import yamahaMark from "@/components/logo/marks/extremecolumbus-brand-yamaha.png";
import hondaMark from "@/components/logo/marks/extremecolumbus-brand-honda.png";
import kawasakiMark from "@/components/logo/marks/extremecolumbus-brand-kawasaki.png";
import seaDooMark from "@/components/logo/marks/extremecolumbus-brand-sea-doo.png";
import suzukiMark from "@/components/logo/marks/extremecolumbus-brand-suzuki.png";
import cfmotoMark from "@/components/logo/marks/extremecolumbus-brand-cfmoto.png";
import indianMark from "@/components/logo/marks/extremecolumbus-brand-indian-motorcycle.png";
import bmwMark from "@/components/logo/marks/extremecolumbus-brand-bmw-motorrad.png";
import ssrMark from "@/components/logo/marks/extremecolumbus-brand-ssr.png";
import slingshotMark from "@/components/logo/marks/slingshot-brand-slider.png";

export interface BrandDef {
  id: string;
  label: string;
  mark?: StaticImageData;
  tagline: string;
  /** Mark is naturally black — invert to white so it stays visible in dark mode. */
  darkInvert?: boolean;
}

/**
 * Brands the shop carries. `id` is the URL slug used for /parts/[brand] and
 * matches the brand keys used in the Amazon parts pipeline; `label` is the
 * display name that appears in part fitment (fitment[].make).
 */
export const brands: BrandDef[] = [
  { id: "can-am", label: "Can-Am", mark: canAmMark, tagline: "Maverick, Defender, Outlander & Renegade", darkInvert: true },
  { id: "polaris", label: "Polaris", mark: polarisMark, tagline: "RZR, Ranger, Sportsman & General" },
  { id: "yamaha", label: "Yamaha", mark: yamahaMark, tagline: "Raptor, Grizzly, Kodiak & Wolverine" },
  { id: "honda", label: "Honda", mark: hondaMark, tagline: "Pioneer, Rancher, Talon & Foreman" },
  { id: "kawasaki", label: "Kawasaki", mark: kawasakiMark, tagline: "Brute Force, Teryx, Mule & KLX", darkInvert: true },
  { id: "sea-doo", label: "Sea-Doo", mark: seaDooMark, tagline: "Spark, GTX, GTI & Wake models", darkInvert: true },
  { id: "ski-doo", label: "Ski-Doo", tagline: "Summit, MX Z & Expedition sleds" },
  { id: "ktm", label: "KTM", tagline: "SX, EXC & Adventure bikes" },
  { id: "suzuki", label: "Suzuki", mark: suzukiMark, tagline: "King Quad, LT-Z & QuadRunner" },
  { id: "cfmoto", label: "CFMOTO", mark: cfmotoMark, tagline: "CForce & ZForce side-by-sides" },
  { id: "arctic-cat", label: "Arctic Cat", tagline: "Wildcat, Alterra & Thundercat" },
];

/** Extra brands the dealership is an authorized dealer for (nav/footer). */
export const dealerBrands: BrandDef[] = [
  ...brands,
  { id: "indian", label: "Indian Motorcycle", mark: indianMark, tagline: "Scout, Chieftain & Challenger" },
  { id: "bmw", label: "BMW Motorrad", mark: bmwMark, tagline: "GS, S1000 & R Series", darkInvert: true },
  { id: "slingshot", label: "Slingshot", mark: slingshotMark, tagline: "Polaris Slingshot 3-wheelers", darkInvert: true },
  { id: "ssr", label: "SSR", mark: ssrMark, tagline: "Pit bikes & mini motos" },
];

export function brandBySlug(slug: string): BrandDef | undefined {
  return brands.find((b) => b.id === slug) ?? dealerBrands.find((b) => b.id === slug);
}

/** Normalize a part fitment make or brand string against a brand definition. */
export function brandMatches(brand: BrandDef, makeOrBrand: string): boolean {
  const n = (s: string) => (s ?? "").toLowerCase().replace(/[\s-]/g, "");
  return n(makeOrBrand) === n(brand.label) || n(makeOrBrand) === n(brand.id);
}
