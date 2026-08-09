"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Plus, CheckCircle2, XCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { ProductImage } from "@/components/ui/product-image";
import { fetchVehicles } from "@/lib/mock-api";
import type { Vehicle } from "@/types/vehicle";

const MAX_COMPARE = 3;

const COMPARE_SPECS = [
  { key: "price", label: "Price", format: (v: Vehicle) => formatCurrency(v.price) },
  { key: "year", label: "Year", format: (v: Vehicle) => String(v.year) },
  { key: "condition", label: "Condition", format: (v: Vehicle) => v.condition },
  { key: "category", label: "Type", format: (v: Vehicle) => v.category.replace(/-/g, " ") },
  { key: "color", label: "Color", format: (v: Vehicle) => v.color },
  { key: "engine", label: "Engine", format: (v: Vehicle) => v.specs.engine ?? "—" },
  { key: "horsepower", label: "Horsepower", format: (v: Vehicle) => v.specs.horsepower ?? "—" },
  { key: "transmission", label: "Transmission", format: (v: Vehicle) => v.specs.transmission ?? "—" },
  { key: "drivetrain", label: "Drivetrain", format: (v: Vehicle) => v.specs.drivetrain ?? "—" },
  { key: "weight", label: "Weight", format: (v: Vehicle) => v.specs.weight ?? "—" },
  { key: "groundClearance", label: "Ground Clearance", format: (v: Vehicle) => v.specs.groundClearance ?? "—" },
  { key: "fuelCapacity", label: "Fuel Capacity", format: (v: Vehicle) => v.specs.fuelCapacity ?? "—" },
  { key: "tires", label: "Tires", format: (v: Vehicle) => v.specs.tires ?? "—" },
  { key: "warranty", label: "Warranty", format: (v: Vehicle) => v.specs.warranty ?? "—" },
];

export default function ComparePage() {
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle[]>([]);
  const [selectorOpen, setSelectorOpen] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchVehicles().then(setAllVehicles);
  }, []);

  const addVehicle = (v: Vehicle) => {
    if (selected.length < MAX_COMPARE && !selected.find((s) => s.id === v.id)) {
      setSelected([...selected, v]);
    }
    setSelectorOpen(null);
    setSearch("");
  };

  const removeVehicle = (id: string) => setSelected(selected.filter((v) => v.id !== id));

  const filteredOptions = allVehicles.filter(
    (v) =>
      !selected.find((s) => s.id === v.id) &&
      (`${v.year} ${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase()))
  );

  const slots = Array.from({ length: MAX_COMPARE }, (_, i) => selected[i] ?? null);

  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-black mb-1">Compare Vehicles</h1>
          <p className="text-muted-foreground text-sm">Select up to {MAX_COMPARE} vehicles to compare side-by-side.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              {/* Spec label column */}
              <th className="w-40 text-left" />
              {slots.map((vehicle, i) => (
                <th key={i} className="p-3 min-w-[220px] align-top">
                  {vehicle ? (
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      <div className="relative aspect-video">
                        <ProductImage
                          src={vehicle.images[0]}
                          alt={vehicle.model}
                          fill
                          className="object-cover"
                          sizes="220px"
                        />
                        <button
                          onClick={() => removeVehicle(vehicle.id)}
                          className="absolute top-2 right-2 size-6 rounded-full bg-black/60 flex items-center justify-center"
                          aria-label="Remove vehicle"
                        >
                          <X className="size-3.5 text-white" />
                        </button>
                      </div>
                      <div className="p-3 text-left">
                        <p className="text-xs text-muted-foreground">{vehicle.make}</p>
                        <p className="font-bold text-sm leading-snug">{vehicle.year} {vehicle.model}</p>
                        <p className="text-orange-600 font-black mt-1">{formatCurrency(vehicle.price)}</p>
                        <Link
                          href={`/inventory/${vehicle.id}`}
                          className="mt-2 block text-center text-xs py-1.5 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => setSelectorOpen(i)}
                        className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-orange-500 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-orange-600 transition-colors"
                      >
                        <Plus className="size-8" />
                        <span className="text-sm font-medium">Add Vehicle</span>
                      </button>

                      {/* Dropdown */}
                      {selectorOpen === i && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-popover border border-border rounded-xl shadow-xl z-10 overflow-hidden">
                          <div className="p-2">
                            <input
                              autoFocus
                              type="text"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              placeholder="Search vehicles…"
                              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {filteredOptions.slice(0, 20).map((v) => (
                              <button
                                key={v.id}
                                onClick={() => addVehicle(v)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted transition-colors text-sm"
                              >
                                <div className="relative size-10 rounded overflow-hidden bg-muted shrink-0">
                                  <ProductImage src={v.images[0]} alt={v.model} fill className="object-cover" sizes="40px" />
                                </div>
                                <div>
                                  <p className="font-medium">{v.year} {v.make} {v.model}</p>
                                  <p className="text-xs text-muted-foreground">{formatCurrency(v.price)}</p>
                                </div>
                              </button>
                            ))}
                            {filteredOptions.length === 0 && (
                              <p className="px-3 py-4 text-sm text-muted-foreground text-center">No vehicles found.</p>
                            )}
                          </div>
                          <div className="p-2 border-t border-border">
                            <button onClick={() => { setSelectorOpen(null); setSearch(""); }} className="w-full text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {COMPARE_SPECS.map(({ key, label, format }, rowIdx) => (
              <tr key={key} className={rowIdx % 2 === 0 ? "bg-muted/20" : ""}>
                <td className="px-3 py-3 text-sm font-semibold text-muted-foreground w-40">{label}</td>
                {slots.map((vehicle, i) => {
                  const val = vehicle ? format(vehicle) : null;
                  return (
                    <td key={i} className="px-3 py-3 text-sm text-center">
                      {val ?? <span className="text-muted-foreground">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
