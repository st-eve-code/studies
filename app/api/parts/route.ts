import { NextRequest, NextResponse } from "next/server";
import { mockParts } from "@/data/mock-parts";
import type { Part, PartFilters } from "@/types/part";

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

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const category  = searchParams.getAll("category") as PartFilters["category"];
  const brand     = searchParams.getAll("brand");
  const type      = searchParams.getAll("type") as PartFilters["type"];
  const priceMin  = searchParams.get("priceMin");
  const priceMax  = searchParams.get("priceMax");
  const search    = searchParams.get("search");
  const sortBy    = searchParams.get("sortBy") as PartFilters["sortBy"];
  const featured  = searchParams.get("featured");
  const fitYear   = searchParams.get("fitmentYear");
  const fitMake   = searchParams.get("fitmentMake");
  const fitModel  = searchParams.get("fitmentModel");

  let results = await getAllParts();

  if (category?.length)  results = results.filter((p) => category.includes(p.category));
  if (brand.length)      results = results.filter((p) => brand.map((b) => b.toLowerCase()).includes(p.brand.toLowerCase()));
  if (type?.length)      results = results.filter((p) => type.includes(p.type));
  if (priceMin)          results = results.filter((p) => p.price >= Number(priceMin));
  if (priceMax)          results = results.filter((p) => p.price <= Number(priceMax));
  if (featured === "true") results = results.filter((p) => p.isFeatured);

  if (fitYear && fitMake && fitModel) {
    results = results.filter(
      (p) =>
        p.fitment.length === 0 ||
        p.fitment.some(
          (f) =>
            f.year === Number(fitYear) &&
            f.make.toLowerCase() === fitMake.toLowerCase() &&
            f.model.toLowerCase() === fitModel.toLowerCase()
        )
    );
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }

  switch (sortBy) {
    case "price-asc":  results.sort((a, b) => a.price - b.price); break;
    case "price-desc": results.sort((a, b) => b.price - a.price); break;
    case "rating":     results.sort((a, b) => b.rating - a.rating); break;
    case "name-asc":   results.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "newest":
    default:
      results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  return NextResponse.json({ data: results, total: results.length });
}
