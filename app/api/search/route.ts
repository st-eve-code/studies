import { NextRequest, NextResponse } from "next/server";
import type { Part } from "@/types/part";

async function getAllParts(): Promise<Part[]> {
  const { default: sp } = await import("@/data/catalog-parts.json", {
    assert: { type: "json" },
  });
  return (sp as Part[]).filter((p) => p.images?.length);
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();

  if (!q) {
    return NextResponse.json({ parts: [] });
  }

  const parts = await getAllParts();

  const matchedParts = parts
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    )
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .slice(0, 6);

  return NextResponse.json({ parts: matchedParts });
}
