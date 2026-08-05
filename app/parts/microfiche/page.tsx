"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  ChevronRight,
  ChevronDown,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import {
  fetchMicroficheModels,
  fetchMicroficheModel,
  type MicroficheModelSummary,
} from "@/lib/mock-api";
import type { MicroficheSection, MicrofichePart, MicroficheModel } from "@/types/part";

function sectionLabel(name: string) {
  return name.split(" - ")[0].trim();
}

/** Percent-positioned hotspot overlay for a diagram. */
function HotspotOverlay({
  section,
  hoveredRef,
  onHover,
}: {
  section: MicroficheSection;
  hoveredRef: string | null;
  onHover: (ref: string | null) => void;
}) {
  const { imageWidth, imageHeight, hotspots } = section;
  if (!imageWidth || !imageHeight || !hotspots?.length) return null;

  return (
    <>
      {hotspots.map((h, i) => {
        const active = hoveredRef === h.refNo;
        const left = (h.x1 / imageWidth) * 100;
        const top = (h.y1 / imageHeight) * 100;
        const width = ((h.x2 - h.x1) / imageWidth) * 100;
        const height = ((h.y2 - h.y1) / imageHeight) * 100;
        return (
          <button
            key={h.hotspotId ?? i}
            aria-label={`Part reference ${h.refNo}`}
            onMouseEnter={() => onHover(h.refNo)}
            onMouseLeave={() => onHover(null)}
            className={cn(
              "absolute rounded-sm border transition-all duration-150",
              active
                ? "bg-orange-500/50 border-orange-500 ring-2 ring-orange-400/60 z-20"
                : "bg-white/20 border-white/60 hover:bg-orange-300/40 z-10"
            )}
            style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
          />
        );
      })}
    </>
  );
}

export default function MicrofichePage() {
  const { addItem } = useCart();

  // Model selector
  const [summaries, setSummaries] = useState<MicroficheModelSummary[]>([]);
  const [make, setMake] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [modelCode, setModelCode] = useState("");

  // Loaded fiche
  const [model, setModel] = useState<MicroficheModel | null>(null);
  const [renderedFor, setRenderedFor] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<MicroficheSection | null>(null);
  const [hoveredRef, setHoveredRef] = useState<string | null>(null);
  const [addedParts, setAddedParts] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const displayModel = model?.modelCode === modelCode ? model : null;
  const loadingModel = modelCode !== "" && !displayModel;

  useEffect(() => {
    fetchMicroficheModels().then(setSummaries);
  }, []);

  const makes = useMemo(
    () => [...new Set(summaries.map((m) => m.make))].sort(),
    [summaries]
  );
  const types = useMemo(
    () => [...new Set(summaries.filter((m) => m.make === make).map((m) => m.vehicleType))].sort(),
    [summaries, make]
  );
  const models = useMemo(
    () =>
      summaries
        .filter((m) => m.make === make && m.vehicleType === vehicleType)
        .sort((a, b) => b.year - a.year),
    [summaries, make, vehicleType]
  );

  useEffect(() => {
    if (!modelCode) return;
    let cancelled = false;
    fetchMicroficheModel(modelCode).then((m) => {
      if (!cancelled) setModel(m);
    });
    return () => {
      cancelled = true;
    };
  }, [modelCode]);

  if (displayModel && renderedFor !== displayModel.modelCode) {
    setRenderedFor(displayModel.modelCode);
    setActiveSection(displayModel.sections[0] ?? null);
  }

  const handleAddPart = (part: MicrofichePart) => {
    addItem({
      id: `cart-${part.sku}`,
      productId: part.sku,
      type: "part",
      name: part.name,
      sku: part.sku,
      image: activeSection?.diagramUrl ?? "",
      price: part.price,
      quantity: part.qty,
    });
    setAddedParts((prev) => new Set([...prev, part.sku]));
    setTimeout(() => setAddedParts((prev) => { const n = new Set(prev); n.delete(part.sku); return n; }), 2500);
  };

  const filteredParts = useMemo(() => {
    if (!activeSection) return [];
    if (!search.trim()) return activeSection.parts;
    const q = search.toLowerCase();
    return activeSection.parts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.refNumber === q
    );
  }, [activeSection, search]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <Link href="/parts" className="hover:text-foreground">Parts</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">OEM Microfiche</span>
          </div>
          <h1 className="text-3xl font-black flex items-center gap-2 mb-2">
            <BookOpen className="size-7 text-orange-500" />
            OEM Parts Microfiche
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Factory exploded-view diagrams with live part numbers and pricing.
            Pick a vehicle to browse its sections and add genuine OEM parts by reference number.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-8">
        {/* Vehicle selector */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Select Your Vehicle
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={make}
              onChange={(e) => { setMake(e.target.value); setVehicleType(""); setModelCode(""); }}
              className="px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Make</option>
              {makes.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              value={vehicleType}
              onChange={(e) => { setVehicleType(e.target.value); setModelCode(""); }}
              disabled={!make}
              className="px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-40"
            >
              <option value="">Category</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={modelCode}
              onChange={(e) => setModelCode(e.target.value)}
              disabled={!vehicleType}
              className="px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-40 sm:col-span-2 lg:col-span-2"
            >
              <option value="">Model</option>
              {models.map((m) => (
                <option key={m.modelCode} value={m.modelCode}>
                  {m.year} {m.model} — {m.sectionCount} sections
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingModel && (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="size-6 animate-spin mr-3" /> Loading diagrams…
          </div>
        )}

        {!loadingModel && displayModel && activeSection && (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
            {/* Section nav */}
            <nav className="space-y-1 max-h-[75vh] overflow-y-auto pr-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-3">
                {displayModel.year} {displayModel.make} — {displayModel.sections.length} Sections
              </p>
              {displayModel.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => { setActiveSection(section); setHoveredRef(null); }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeSection.id === section.id
                      ? "bg-orange-600 text-white"
                      : "hover:bg-muted text-foreground/80"
                  )}
                >
                  {sectionLabel(section.name)}
                </button>
              ))}
            </nav>

            {/* Main content */}
            <div className="space-y-6 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-black">{sectionLabel(activeSection.name)}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {displayModel.make} {displayModel.vehicleType} · {displayModel.year} {displayModel.model}
                  </p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search parts…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 w-56"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Exploded diagram */}
                <div className="rounded-xl overflow-hidden border border-border bg-muted">
                  <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Exploded View {activeSection.hotspots?.length ? `· ${activeSection.hotspots.length} references` : ""}
                    </p>
                  </div>
                  <div className="relative">
                    <img
                      src={activeSection.diagramUrl}
                      alt={`${sectionLabel(activeSection.name)} diagram`}
                      width={activeSection.imageWidth ?? 800}
                      height={activeSection.imageHeight ?? 600}
                      className="w-full h-auto block"
                      loading="lazy"
                    />
                    <HotspotOverlay
                      section={activeSection}
                      hoveredRef={hoveredRef}
                      onHover={setHoveredRef}
                    />
                  </div>
                </div>

                {/* Parts list */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {filteredParts.length} Parts in this Section
                    </p>
                  </div>
                  <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
                    {filteredParts.length === 0 && (
                      <p className="px-4 py-8 text-sm text-muted-foreground text-center">
                        No parts match your search.
                      </p>
                    )}
                    {filteredParts.map((part) => (
                      <div
                        key={`${part.refNumber}-${part.sku}`}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                          hoveredRef === part.refNumber && "bg-orange-50 dark:bg-orange-950/20"
                        )}
                        onMouseEnter={() => setHoveredRef(part.refNumber || null)}
                        onMouseLeave={() => setHoveredRef(null)}
                      >
                        <span className="size-7 shrink-0 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                          {part.refNumber || "–"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{part.name}</p>
                          <p className="text-xs text-muted-foreground">
                            SKU: {part.sku} · Qty: {part.qty}
                            {part.note && <span className="text-amber-600 ml-1">{part.note}</span>}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-foreground">{formatCurrency(part.price)}</p>
                          <p className={cn(
                            "text-[10px] font-medium",
                            part.availability === "in-stock" ? "text-green-600" : "text-amber-500"
                          )}>
                            {part.availability.replace(/-/g, " ")}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddPart(part)}
                          disabled={part.availability === "out-of-stock" || part.availability === "discontinued"}
                          className={cn(
                            "shrink-0 size-8 rounded-lg flex items-center justify-center transition-colors",
                            addedParts.has(part.sku)
                              ? "bg-green-600 text-white"
                              : "bg-orange-600 text-white hover:bg-orange-700",
                            "disabled:opacity-40 disabled:cursor-not-allowed"
                          )}
                          aria-label="Add to cart"
                        >
                          {addedParts.has(part.sku)
                            ? <CheckCircle2 className="size-4" />
                            : <ShoppingCart className="size-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-5 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm bg-white/20 border border-white/60 inline-block" /> Hover to highlight ref #
                </span>
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="size-3.5" /> Prices shown are current dealer list — superseded parts noted inline
                </span>
              </div>
            </div>
          </div>
        )}

        {!loadingModel && displayModel && !activeSection && (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="size-12 mx-auto mb-4 opacity-30" />
            <p>No sections available for this vehicle.</p>
          </div>
        )}

        {!loadingModel && !displayModel && (
          <div className="text-center py-16 text-muted-foreground">
            <ChevronDown className="size-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">Select a vehicle to view its diagrams.</p>
            <p className="text-sm mt-1">OEM fiche for Honda, Husqvarna, Polaris &amp; Slingshot.</p>
          </div>
        )}
      </div>
    </div>
  );
}
