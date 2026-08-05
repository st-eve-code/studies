import { NextRequest, NextResponse } from "next/server";
import { mockVehicles } from "@/data/mock-vehicles";
import { mockParts } from "@/data/mock-parts";
import type { Vehicle } from "@/types/vehicle";
import type { Part } from "@/types/part";

async function getAll(): Promise<{ vehicles: Vehicle[]; parts: Part[] }> {
  let vehicles = [...mockVehicles];
  let parts = [...mockParts];

  try {
    const { default: sv } = await import("@/data/scraped-vehicles.json", {
      assert: { type: "json" },
    });
    vehicles = [...vehicles, ...(sv as Vehicle[])];
  } catch { /* scraped file not generated yet — use mock only */ }

  try {
    const { default: sp } = await import("@/data/catalog-parts.json", {
      assert: { type: "json" },
    });
    parts = [...parts, ...(sp as Part[])];
  } catch { /* catalog file not generated yet — use mock only */ }

  return { vehicles, parts };
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();

  if (!q) {
    return NextResponse.json({ vehicles: [], parts: [] });
  }

  const { vehicles, parts } = await getAll();

  const matchedVehicles = vehicles
    .filter(
      (v) =>
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        String(v.year).includes(q) ||
        v.category.includes(q)
    )
    .slice(0, 6);

  const matchedParts = parts
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    )
    .slice(0, 6);

  return NextResponse.json({ vehicles: matchedVehicles, parts: matchedParts });
}
