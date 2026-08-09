import { NextRequest, NextResponse } from "next/server";
import type { Part } from "@/types/part";

// Real parts catalog scraped from the dealer store (no mock/demo data).
async function getAllParts(): Promise<Part[]> {
  const { default: scraped } = await import("@/data/catalog-parts.json", {
    assert: { type: "json" },
  });
  return (scraped as Part[]).filter((p) => p.images?.length);
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
