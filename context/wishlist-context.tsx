"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type { WishlistItem } from "@/types/cart";

interface WishlistState {
  items: WishlistItem[];
}

type WishlistAction =
  | { type: "ADD"; payload: WishlistItem }
  | { type: "REMOVE"; payload: string }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; payload: WishlistItem[] };

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.payload };
    case "ADD": {
      if (state.items.some((i) => i.productId === action.payload.productId)) return state;
      return { items: [...state.items, action.payload] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.productId !== action.payload) };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  isWishlisted: (productId: string) => boolean;
  toggle: (item: WishlistItem) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = "xps_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) dispatch({ type: "HYDRATE", payload: JSON.parse(saved) });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch { /* ignore */ }
  }, [state.items]);

  const addItem = useCallback((item: WishlistItem) => dispatch({ type: "ADD", payload: item }), []);
  const removeItem = useCallback((productId: string) => dispatch({ type: "REMOVE", payload: productId }), []);
  const clearWishlist = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const isWishlisted = useCallback((productId: string) => state.items.some((i) => i.productId === productId), [state.items]);
  const toggle = useCallback((item: WishlistItem) => {
    if (state.items.some((i) => i.productId === item.productId)) {
      dispatch({ type: "REMOVE", payload: item.productId });
    } else {
      dispatch({ type: "ADD", payload: item });
    }
  }, [state.items]);

  return (
    <WishlistContext.Provider value={{
      items: state.items,
      count: state.items.length,
      addItem,
      removeItem,
      clearWishlist,
      isWishlisted,
      toggle,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
