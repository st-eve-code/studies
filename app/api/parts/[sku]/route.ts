import { NextRequest, NextResponse } from "next/server";
import { mockParts } from "@/data/mock-parts";
import type { Part } from "@/types/part";

async function getAllParts(): Promise<Part[]> {
  const base = [...mockParts];
  try {
    const { default: scraped } = await import("@/data/catalog-parts.json", {
      assert: { type: "json" },
    });
    return [...base, ...(scraped as Part[])];
  } catch {
    return base;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  const { sku } = await params;
  const all = await getAllParts();
  const part = all.find((p) => p.sku === decodeURIComponent(sku));

  if (!part) {
    return NextResponse.json({ error: "Part not found" }, { status: 404 });
  }

  return NextResponse.json({ data: part });
}
