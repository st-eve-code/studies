import { NextRequest, NextResponse } from "next/server";
import type { Vehicle } from "@/types/vehicle";

// Real listings scraped from the dealer site only (no mock/demo data).
async function getAllVehicles(): Promise<Vehicle[]> {
  const { default: scraped } = await import("@/data/scraped-vehicles.json", {
    assert: { type: "json" },
  });
  return (scraped as Vehicle[]).filter((v) => v.images?.length);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const all = await getAllVehicles();
  const vehicle = all.find((v) => v.id === id);

  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json({ data: vehicle });
}
