import { NextRequest, NextResponse } from "next/server";
import type { MicroficheModel } from "@/types/part";

type DataFile = { default: MicroficheModel[] };

async function loadModels(): Promise<MicroficheModel[]> {
  try {
    const { default: models } = (await import("@/data/scraped-microfiche.json", {
      assert: { type: "json" },
    })) as DataFile;
    return models;
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const modelCode = searchParams.get("model");
  const make = searchParams.get("make");

  const models = await loadModels();
  if (!models.length) {
    return NextResponse.json({ error: "Microfiche data unavailable" }, { status: 404 });
  }

  // Full section payload for a specific model.
  if (modelCode) {
    const model = models.find((m) => m.modelCode === modelCode);
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    return NextResponse.json({ data: model });
  }

  // Lightweight summaries for the model selector.
  const list = models
    .filter((m) => !make || m.make.toLowerCase() === make.toLowerCase())
    .map(({ make, vehicleType, year, model, modelCode, sections }) => ({
      make,
      vehicleType,
      year,
      model,
      modelCode,
      sectionCount: sections.length,
      partCount: sections.reduce((n, s) => n + s.parts.length, 0),
    }));

  return NextResponse.json({ data: list });
}
