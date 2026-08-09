import { NextResponse } from "next/server";
import type { Vehicle } from "@/types/vehicle";
import type { Part, MicroficheModel } from "@/types/part";
import { matchPartsForVehicle } from "@/lib/parts-match";

async function getVehicle(id: string): Promise<Vehicle | null> {
  const { default: scraped } = await import("@/data/scraped-vehicles.json", {
    assert: { type: "json" },
  });
  const vehicle = (scraped as Vehicle[]).find((v) => v.id === id);
  return vehicle && vehicle.images?.length ? vehicle : null;
}

async function getAllParts(): Promise<Part[]> {
  const { default: catalog } = await import("@/data/catalog-parts.json", {
    assert: { type: "json" },
  });
  return catalog as Part[];
}

async function getFiche(): Promise<MicroficheModel[]> {
  try {
    const { default: models } = (await import("@/data/scraped-microfiche.json", {
      assert: { type: "json" },
    })) as { default: MicroficheModel[] };
    return models;
  } catch {
    return [];
  }
}

async function getFicheMap() {
  try {
    const { default: map } = (await import("@/data/fiche-model-map.json", {
      assert: { type: "json" },
    })) as { default: { modelCode: string; keywords: string[] }[] };
    return map;
  } catch {
    return [];
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  const [allParts, ficheModels, ficheMap] = await Promise.all([
    getAllParts(),
    getFiche(),
    getFicheMap(),
  ]);

  const result = await matchPartsForVehicle(vehicle, allParts, ficheModels, ficheMap);
  return NextResponse.json({ data: result });
}
