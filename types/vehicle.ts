export type VehicleCondition = "new" | "used" | "certified-pre-owned";
export type VehicleCategory = "atv" | "utv" | "dirt-bike" | "personal-watercraft" | "snowmobile" | "street-bike";
export type VehicleStatus = "in-stock" | "sold" | "on-order" | "demo";

export interface VehicleSpec {
  engine?: string;
  displacement?: string;
  horsepower?: string;
  torque?: string;
  transmission?: string;
  drivetrain?: string;
  fuelCapacity?: string;
  seatHeight?: string;
  groundClearance?: string;
  weight?: string;
  payloadCapacity?: string;
  towingCapacity?: string;
  bedDimensions?: string;
  wheelbase?: string;
  length?: string;
  width?: string;
  height?: string;
  suspension?: string;
  brakes?: string;
  tires?: string;
  fuelSystem?: string;
  cooling?: string;
  color?: string;
  warranty?: string;
}

export interface Vehicle {
  id: string;
  vin?: string;
  stockNumber: string;
  condition: VehicleCondition;
  category: VehicleCategory;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  msrp?: number;
  mileage?: number;
  hours?: number;
  color: string;
  images: string[];
  specs: VehicleSpec;
  features: string[];
  description: string;
  status: VehicleStatus;
  isFeatured: boolean;
  isNew: boolean;
  badge?: string; // e.g. "Hot Deal", "Low Miles", "New Arrival"
  dealerNotes?: string;
  sourceUrl?: string; // present on listings scraped from the dealer's live site
  createdAt: string;
}

export interface VehicleFilters {
  condition?: VehicleCondition[];
  category?: VehicleCategory[];
  make?: string[];
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  status?: VehicleStatus[];
  search?: string;
  sortBy?: "price-asc" | "price-desc" | "year-desc" | "year-asc" | "newest";
}

export interface CompareVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number;
  image: string;
}
