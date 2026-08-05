import { NextRequest, NextResponse } from "next/server";
import { mockVehicles } from "@/data/mock-vehicles";
import type { Vehicle } from "@/types/vehicle";

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
