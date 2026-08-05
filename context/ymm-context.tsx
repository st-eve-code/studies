"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { YMMSelection } from "@/types/ymm";

interface YMMContextValue {
  selection: YMMSelection;
  setYear: (year: number | null) => void;
  setMake: (make: string | null) => void;
  setModel: (model: string | null) => void;
  setTrim: (trim: string | null) => void;
  setSelection: (sel: YMMSelection) => void;
  clearSelection: () => void;
  hasSelection: boolean;
  label: string;
}

const defaultSelection: YMMSelection = {
  year: null,
  make: null,
  model: null,
  trim: null,
};

const YMMContext = createContext<YMMContextValue | null>(null);

export function YMMProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelectionState] = useState<YMMSelection>(defaultSelection);

  const setYear = useCallback((year: number | null) => {
    setSelectionState((prev) => ({ ...prev, year, make: null, model: null, trim: null }));
  }, []);

  const setMake = useCallback((make: string | null) => {
    setSelectionState((prev) => ({ ...prev, make, model: null, trim: null }));
  }, []);

  const setModel = useCallback((model: string | null) => {
    setSelectionState((prev) => ({ ...prev, model, trim: null }));
  }, []);

  const setTrim = useCallback((trim: string | null) => {
    setSelectionState((prev) => ({ ...prev, trim }));
  }, []);

  const setSelection = useCallback((sel: YMMSelection) => {
    setSelectionState(sel);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState(defaultSelection);
  }, []);

  const hasSelection = Boolean(
    selection.year && selection.make && selection.model
  );

  const label = hasSelection
    ? `${selection.year} ${selection.make} ${selection.model}${selection.trim ? ` ${selection.trim}` : ""}`
    : "Select Your Vehicle";

  return (
    <YMMContext.Provider
      value={{
        selection,
        setYear,
        setMake,
        setModel,
        setTrim,
        setSelection,
        clearSelection,
        hasSelection,
        label,
      }}
    >
      {children}
    </YMMContext.Provider>
  );
}

export function useYMM(): YMMContextValue {
  const ctx = useContext(YMMContext);
  if (!ctx) throw new Error("useYMM must be used inside <YMMProvider>");
  return ctx;
}
