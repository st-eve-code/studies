import { NextRequest, NextResponse } from "next/server";
import { mockVehicles } from "@/data/mock-vehicles";
import type { Vehicle, VehicleFilters } from "@/types/vehicle";

// Merge scraped vehicles if the file exists
async function getAllVehicles(): Promise<Vehicle[]> {
  const base = [...mockVehicles];
  try {
    const { default: scraped } = await import("@/data/scraped-vehicles.json", {
      assert: { type: "json" },
    });
    return [...base, ...(scraped as Vehicle[])];
  } catch {
    return base;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const category = searchParams.getAll("category");
  const condition = searchParams.getAll("condition");
  const make = searchParams.getAll("make");
  const yearMin = searchParams.get("yearMin");
  const yearMax = searchParams.get("yearMax");
  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") as VehicleFilters["sortBy"];
  const featured = searchParams.get("featured");

  let results = await getAllVehicles();

  if (category.length) {
    results = results.filter((v) => category.includes(v.category));
  }
  if (condition.length) {
    results = results.filter((v) => condition.includes(v.condition));
  }
  if (make.length) {
    results = results.filter((v) =>
      make.map((m) => m.toLowerCase()).includes(v.make.toLowerCase())
    );
  }
  if (yearMin) results = results.filter((v) => v.year >= Number(yearMin));
  if (yearMax) results = results.filter((v) => v.year <= Number(yearMax));
  if (priceMin) results = results.filter((v) => v.price >= Number(priceMin));
  if (priceMax) results = results.filter((v) => v.price <= Number(priceMax));
  if (featured === "true") results = results.filter((v) => v.isFeatured);

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (v) =>
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        String(v.year).includes(q) ||
        v.stockNumber.toLowerCase().includes(q)
    );
  }

  switch (sortBy) {
    case "price-asc":   results.sort((a, b) => a.price - b.price); break;
    case "price-desc":  results.sort((a, b) => b.price - a.price); break;
    case "year-desc":   results.sort((a, b) => b.year - a.year); break;
    case "year-asc":    results.sort((a, b) => a.year - b.year); break;
    case "newest":
    default:
      results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  return NextResponse.json({ data: results, total: results.length });
}
