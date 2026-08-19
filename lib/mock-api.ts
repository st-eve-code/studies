/**
 * API client layer — all data now flows through Next.js Route Handlers.
 * The route handlers merge mock data + scraped data automatically.
 *
 * During SSR the base URL is resolved from the environment.
 * On the client, relative URLs work natively.
 */

import type { Vehicle, VehicleFilters } from "@/types/vehicle";
import type { Part, PartFilters, MicroficheModel } from "@/types/part";

// ── Base URL helper ───────────────────────────────────────────────────────────

function baseUrl(): string {
  // Server-side: need an absolute URL
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  }
  // Client-side: relative works fine
  return "";
}

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const res = await fetch(url, {
    next: { revalidate: 60 }, // ISR — refresh every 60 s
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json();
}

// ── Vehicles ──────────────────────────────────────────────────────────────────

export async function fetchVehicles(filters?: VehicleFilters): Promise<Vehicle[]> {
  const params = new URLSearchParams();

  if (filters?.category?.length)  filters.category.forEach((c) => params.append("category", c));
  if (filters?.condition?.length) filters.condition.forEach((c) => params.append("condition", c));
  if (filters?.make?.length)      filters.make.forEach((m) => params.append("make", m));
  if (filters?.yearMin != null)   params.set("yearMin", String(filters.yearMin));
  if (filters?.yearMax != null)   params.set("yearMax", String(filters.yearMax));
  if (filters?.priceMin != null)  params.set("priceMin", String(filters.priceMin));
  if (filters?.priceMax != null)  params.set("priceMax", String(filters.priceMax));
  if (filters?.search)            params.set("search", filters.search);
  if (filters?.sortBy)            params.set("sortBy", filters.sortBy);

  const qs = params.toString();
  const { data } = await apiFetch<{ data: Vehicle[] }>(`/api/vehicles${qs ? `?${qs}` : ""}`);
  return data;
}

export async function fetchVehicleById(id: string): Promise<Vehicle | null> {
  try {
    const { data } = await apiFetch<{ data: Vehicle }>(`/api/vehicles/${encodeURIComponent(id)}`);
    return data;
  } catch {
    return null;
  }
}

export interface VehiclePartsResponse {
  parts: Part[];
  source: "model" | "make" | "none";
  ficheModelCount: number;
}

export async function fetchVehicleParts(id: string): Promise<VehiclePartsResponse | null> {
  try {
    const { data } = await apiFetch<{ data: VehiclePartsResponse }>(
      `/api/vehicles/${encodeURIComponent(id)}/parts`
    );
    return data;
  } catch {
    return null;
  }
}

export async function fetchFeaturedVehicles(): Promise<Vehicle[]> {
  // Prefer real listings scraped from the dealer site over mock/fake data.
  const { data } = await apiFetch<{ data: Vehicle[] }>(
    "/api/vehicles?source=scraped&sortBy=newest&limit=6"
  );
  return data;
}

// ── Parts ─────────────────────────────────────────────────────────────────────

export async function fetchParts(filters?: PartFilters): Promise<Part[]> {
  const params = new URLSearchParams();

  if (filters?.category?.length)    filters.category.forEach((c) => params.append("category", c));
  if (filters?.brand?.length)       filters.brand.forEach((b) => params.append("brand", b));
  if (filters?.type?.length)        filters.type.forEach((t) => params.append("type", t));
  if (filters?.priceMin != null)    params.set("priceMin", String(filters.priceMin));
  if (filters?.priceMax != null)    params.set("priceMax", String(filters.priceMax));
  if (filters?.search)              params.set("search", filters.search);
  if (filters?.sortBy)              params.set("sortBy", filters.sortBy);
  if (filters?.fitmentYear != null) params.set("fitmentYear", String(filters.fitmentYear));
  if (filters?.fitmentMake)         params.set("fitmentMake", filters.fitmentMake);
  if (filters?.fitmentModel)        params.set("fitmentModel", filters.fitmentModel);

  const qs = params.toString();
  const { data } = await apiFetch<{ data: Part[] }>(`/api/parts${qs ? `?${qs}` : ""}`);
  return data;
}

export async function fetchPartBySku(sku: string): Promise<Part | null> {
  try {
    const { data } = await apiFetch<{ data: Part }>(`/api/parts/${encodeURIComponent(sku)}`);
    return data;
  } catch {
    return null;
  }
}

export async function fetchPartsByFitment(year: number, make: string, model: string): Promise<Part[]> {
  const params = new URLSearchParams({
    fitmentYear: String(year),
    fitmentMake: make,
    fitmentModel: model,
  });
  const { data } = await apiFetch<{ data: Part[] }>(`/api/parts?${params}`);
  return data;
}

export async function fetchFeaturedParts(): Promise<Part[]> {
  const { data } = await apiFetch<{ data: Part[] }>(
    "/api/parts?featured=true&sortBy=rating&limit=8"
  );
  return data;
}

// ── Microfiche ───────────────────────────────────────────────────────────────

export interface MicroficheModelSummary {
  make: string;
  vehicleType: string;
  year: number;
  model: string;
  modelCode: string;
  sectionCount: number;
  partCount: number;
}

export async function fetchMicroficheModels(make?: string): Promise<MicroficheModelSummary[]> {
  const qs = make ? `?make=${encodeURIComponent(make)}` : "";
  const { data } = await apiFetch<{ data: MicroficheModelSummary[] }>(`/api/microfiche${qs}`);
  return data;
}

export async function fetchMicroficheModel(modelCode: string): Promise<MicroficheModel | null> {
  try {
    const { data } = await apiFetch<{ data: MicroficheModel }>(
      `/api/microfiche?model=${encodeURIComponent(modelCode)}`
    );
    return data;
  } catch {
    return null;
  }
}

// ── Unified search ────────────────────────────────────────────────────────────

export interface SearchResult {
  parts: Part[];
}

export async function fetchSearchResults(query: string): Promise<SearchResult> {
  if (!query.trim()) return { parts: [] };
  return apiFetch<SearchResult>(`/api/search?q=${encodeURIComponent(query)}`);
}
