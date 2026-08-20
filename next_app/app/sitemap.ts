import type { MetadataRoute } from "next";
import type { Vehicle } from "@/types/vehicle";
import { siteConfig } from "@/lib/site-config";

const BASE_URL = siteConfig.url;

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/inventory", changeFrequency: "daily", priority: 0.9 },
  { path: "/parts", changeFrequency: "weekly", priority: 0.7 },
  { path: "/services/trade-in", changeFrequency: "monthly", priority: 0.6 },
  { path: "/parts/microfiche", changeFrequency: "monthly", priority: 0.5 },
  { path: "/inventory/compare", changeFrequency: "monthly", priority: 0.4 },
  { path: "/company/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/company/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/company/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/company/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/company/promotions", changeFrequency: "weekly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let vehicles: Vehicle[] = [];
  try {
    const { default: scraped } = await import("@/data/scraped-vehicles.json", {
      assert: { type: "json" },
    });
    vehicles = scraped as Vehicle[];
  } catch {
    vehicles = [];
  }

  return [
    ...staticRoutes.map(({ path, changeFrequency, priority }) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })),
    ...vehicles.map((v) => ({
      url: `${BASE_URL}/inventory/${v.id}`,
      lastModified: v.createdAt ? new Date(v.createdAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
