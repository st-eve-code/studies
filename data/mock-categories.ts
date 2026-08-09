import type { VehicleCategory } from "@/types/vehicle";
import type { PartCategory } from "@/types/part";

export interface VehicleCategoryDef {
  id: VehicleCategory;
  label: string;
  description: string;
  count: number;
}

export interface PartCategoryDef {
  id: PartCategory;
  label: string;
  description: string;
}

export const vehicleCategories: VehicleCategoryDef[] = [
  {
    id: "atv",
    label: "ATVs",
    description: "Sport & utility all-terrain vehicles",
    count: 76,
  },
  {
    id: "utv",
    label: "UTVs / Side-by-Sides",
    description: "2, 4 & 6 seat side-by-side vehicles",
    count: 172,
  },
  {
    id: "dirt-bike",
    label: "Dirt Bikes",
    description: "Motocross, enduro & trail bikes",
    count: 2,
  },
  {
    id: "personal-watercraft",
    label: "Personal Watercraft",
    description: "Jet skis & stand-up watercraft",
    count: 59,
  },
  {
    id: "snowmobile",
    label: "Snowmobiles",
    description: "Mountain, trail & touring sleds",
    count: 25,
  },
  {
    id: "street-bike",
    label: "Street Bikes",
    description: "Sport, naked & adventure motorcycles",
    count: 39,
  },
];

export const partCategories: PartCategoryDef[] = [
  { id: "engine", label: "Engine", description: "Engine components and rebuild kits" },
  { id: "exhaust", label: "Exhaust", description: "Slip-ons, full systems & headers" },
  { id: "suspension", label: "Suspension", description: "Shocks, springs & linkage" },
  { id: "brakes", label: "Brakes", description: "Pads, rotors, lines & calipers" },
  { id: "electrical", label: "Electrical", description: "Stators, regulators & harnesses" },
  { id: "body-plastics", label: "Body & Plastics", description: "Fenders, panels & fairings" },
  { id: "tires-wheels", label: "Tires & Wheels", description: "ATV/UTV tires, rims & beadlocks" },
  { id: "drivetrain", label: "Drivetrain", description: "Belts, chains, axles & differentials" },
  { id: "fuel-system", label: "Fuel System", description: "Carbs, injectors & fuel pumps" },
  { id: "air-filter", label: "Air Filtration", description: "Air filters, pre-filters & intakes" },
  { id: "lighting", label: "Lighting", description: "LED bars, pods & headlight upgrades" },
  { id: "handlebars-controls", label: "Handlebars & Controls", description: "Bars, grips, levers & throttles" },
  { id: "protection", label: "Protection", description: "Skid plates, guards & frame savers" },
  { id: "riding-gear", label: "Riding Gear", description: "Helmets, boots, gloves & jerseys" },
  { id: "storage-cargo", label: "Storage & Cargo", description: "Bags, racks & cargo systems" },
  { id: "winch-recovery", label: "Winch & Recovery", description: "Winches, tow straps & recovery gear" },
  { id: "communication", label: "Communication", description: "Intercom, GPS & action cameras" },
  { id: "performance", label: "Performance Tuning", description: "ECU tunes, power commanders & more" },
  { id: "oem-replacement", label: "OEM Replacement", description: "Factory original replacement parts" },
  { id: "accessories", label: "Accessories", description: "Everything else for your ride" },
];

export const vehicleBrands = [
  { id: "can-am", label: "Can-Am", logo: "/images/brands/can-am.png" },
  { id: "polaris", label: "Polaris", logo: "/images/brands/polaris.png" },
  { id: "yamaha", label: "Yamaha", logo: "/images/brands/yamaha.png" },
  { id: "honda", label: "Honda", logo: "/images/brands/honda.png" },
  { id: "kawasaki", label: "Kawasaki", logo: "/images/brands/kawasaki.png" },
  { id: "ktm", label: "KTM", logo: "/images/brands/ktm.png" },
  { id: "sea-doo", label: "Sea-Doo", logo: "/images/brands/sea-doo.png" },
  { id: "ski-doo", label: "Ski-Doo", logo: "/images/brands/ski-doo.png" },
  { id: "arctic-cat", label: "Arctic Cat", logo: "/images/brands/arctic-cat.png" },
  { id: "cfmoto", label: "CFMOTO", logo: "/images/brands/cfmoto.png" },
];

export const promoBanners = [
  {
    id: "promo-1",
    title: "Summer Riding Season",
    subtitle: "Save up to $2,000 on select Can-Am & Polaris UTVs",
    ctaText: "Shop UTVs",
    ctaHref: "/inventory?category=utv",
    badge: "Limited Time",
    bgColor: "from-orange-600 to-red-700",
  },
  {
    id: "promo-2",
    title: "OEM Parts Week",
    subtitle: "15% off all Honda & Yamaha OEM parts through Sunday",
    ctaText: "Shop Parts",
    ctaHref: "/parts?type=oem",
    badge: "This Week Only",
    bgColor: "from-blue-700 to-indigo-800",
  },
  {
    id: "promo-3",
    title: "Gear Up Sale",
    subtitle: "Troy Lee, Alpinestars & Fox helmets starting at $149",
    ctaText: "Shop Gear",
    ctaHref: "/parts?category=riding-gear",
    badge: "While Supplies Last",
    bgColor: "from-gray-800 to-gray-900",
  },
];
