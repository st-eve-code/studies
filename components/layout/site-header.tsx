"use client";

import { useState, useEffect } from "react";
import { Header } from "./header";
import { SearchModal } from "@/components/features/search-modal";

/**
 * Thin client wrapper that owns the search-modal open state
 * and wires it to both the Header button and the Cmd+K shortcut.
 */
export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
