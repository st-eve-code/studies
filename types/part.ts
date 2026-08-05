export type PartCategory =
  | "engine"
  | "exhaust"
  | "suspension"
  | "brakes"
  | "electrical"
  | "body-plastics"
  | "tires-wheels"
  | "drivetrain"
  | "fuel-system"
  | "air-filter"
  | "lighting"
  | "handlebars-controls"
  | "protection"
  | "riding-gear"
  | "storage-cargo"
  | "winch-recovery"
  | "communication"
  | "performance"
  | "oem-replacement"
  | "accessories";

export type PartType = "oem" | "aftermarket" | "performance";
export type PartAvailability = "in-stock" | "out-of-stock" | "special-order" | "discontinued";

export interface YMMFitment {
  year: number;
  make: string;
  model: string;
  trim?: string;
  notes?: string;
}

export interface PartSpec {
  material?: string;
  finish?: string;
  dimensions?: string;
  weight?: string;
  installTime?: string;
  requiresProfessionalInstall?: boolean;
  partNumbers?: string[];
  replaces?: string[];
}

export interface Part {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: PartCategory;
  type: PartType;
  price: number;
  msrp?: number;
  images: string[];
  description: string;
  shortDescription: string;
  specs: PartSpec;
  fitment: YMMFitment[];
  availability: PartAvailability;
  stockQty: number;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  relatedSkus?: string[];
  createdAt: string;
}

export interface PartFilters {
  category?: PartCategory[];
  brand?: string[];
  type?: PartType[];
  priceMin?: number;
  priceMax?: number;
  availability?: PartAvailability[];
  fitmentYear?: number;
  fitmentMake?: string;
  fitmentModel?: string;
  search?: string;
  sortBy?: "price-asc" | "price-desc" | "newest" | "rating" | "name-asc";
}

export interface MicroficheHotspot {
  refNo: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  hotspotId?: string;
  coords?: string;
}

export interface MicroficheSection {
  id: string;
  name: string;
  diagramUrl: string;
  parts: MicrofichePart[];
  imageWidth?: number;
  imageHeight?: number;
  hotspots?: MicroficheHotspot[];
}

export interface MicrofichePart {
  refNumber: string;
  sku: string;
  name: string;
  qty: number;
  price: number;
  availability: PartAvailability;
  note?: string;
  replaces?: string;
  msrp?: number;
}

export interface MicroficheModel {
  make: string;
  vehicleType: string;
  year: number;
  model: string;
  modelCode: string;
  sections: MicroficheSection[];
}
