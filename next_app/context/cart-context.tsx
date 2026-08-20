"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type { CartItem, CartTotals, PromoCode, ShippingMethod } from "@/types/cart";
import { calcShipping, calcTax } from "@/lib/utils";

const TAX_RATE = 0.0775;
const FREE_SHIPPING_THRESHOLD = 150;

const PROMO_CODES: PromoCode[] = [
  { code: "XTRM10", discountType: "percent", discountValue: 10, description: "10% off your order" },
  { code: "SAVE25", discountType: "fixed", discountValue: 25, minOrder: 100, description: "$25 off orders over $100" },
  { code: "FREESHIP", discountType: "fixed", discountValue: 0, description: "Free standard shipping" },
];

// ── State & Actions ───────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
  promoCode: PromoCode | null;
  promoError: string | null;
  shippingMethod: ShippingMethod;
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QTY"; payload: { id: string; qty: number } }
  | { type: "CLEAR_CART" }
  | { type: "APPLY_PROMO"; payload: string }
  | { type: "REMOVE_PROMO" }
  | { type: "SET_SHIPPING"; payload: ShippingMethod }
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "HYDRATE"; payload: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.payload };

    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: Math.min(i.quantity + action.payload.quantity, i.maxQty ?? 99) }
              : i
          ),
          isOpen: true,
        };
      }
      return { ...state, items: [...state.items, action.payload], isOpen: true };
    }

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };

    case "UPDATE_QTY":
      if (action.payload.qty <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id
            ? { ...i, quantity: Math.min(action.payload.qty, i.maxQty ?? 99) }
            : i
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [], promoCode: null, promoError: null };

    case "APPLY_PROMO": {
      const code = PROMO_CODES.find(
        (p) => p.code.toUpperCase() === action.payload.toUpperCase()
      );
      if (!code) return { ...state, promoCode: null, promoError: "Invalid promo code." };
      return { ...state, promoCode: code, promoError: null };
    }

    case "REMOVE_PROMO":
      return { ...state, promoCode: null, promoError: null };

    case "SET_SHIPPING":
      return { ...state, shippingMethod: action.payload };

    case "SET_OPEN":
      return { ...state, isOpen: action.payload };

    default:
      return state;
  }
}

// ── Totals calculator ─────────────────────────────────────────────────────────

function calcTotals(state: CartState): CartTotals {
  const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);

  let discount = 0;
  if (state.promoCode) {
    const { discountType, discountValue, minOrder } = state.promoCode;
    if (!minOrder || subtotal >= minOrder) {
      discount =
        discountType === "percent"
          ? subtotal * (discountValue / 100)
          : discountValue;
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping =
    state.promoCode?.code === "FREESHIP"
      ? 0
      : discountedSubtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : calcShipping(discountedSubtotal, state.shippingMethod);

  const tax = calcTax(discountedSubtotal, TAX_RATE);
  const total = discountedSubtotal + shipping + tax;

  return { subtotal, discount, shippingEstimate: shipping, taxRate: TAX_RATE, tax, total };
}

// ── Context ───────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[];
  totals: CartTotals;
  promoCode: PromoCode | null;
  promoError: string | null;
  shippingMethod: ShippingMethod;
  isOpen: boolean;
  itemCount: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  applyPromo: (code: string) => void;
  removePromo: () => void;
  setShipping: (method: ShippingMethod) => void;
  setOpen: (open: boolean) => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "xps_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    promoCode: null,
    promoError: null,
    shippingMethod: "standard",
    isOpen: false,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dispatch({ type: "HYDRATE", payload: JSON.parse(saved) });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore storage errors
    }
  }, [state.items]);

  const totals = calcTotals(state);
  const itemCount = state.items.reduce((s, i) => s + i.quantity, 0);

  const addItem = useCallback((item: CartItem) => dispatch({ type: "ADD_ITEM", payload: item }), []);
  const removeItem = useCallback((id: string) => dispatch({ type: "REMOVE_ITEM", payload: id }), []);
  const updateQty = useCallback((id: string, qty: number) => dispatch({ type: "UPDATE_QTY", payload: { id, qty } }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const applyPromo = useCallback((code: string) => dispatch({ type: "APPLY_PROMO", payload: code }), []);
  const removePromo = useCallback(() => dispatch({ type: "REMOVE_PROMO" }), []);
  const setShipping = useCallback((method: ShippingMethod) => dispatch({ type: "SET_SHIPPING", payload: method }), []);
  const setOpen = useCallback((open: boolean) => dispatch({ type: "SET_OPEN", payload: open }), []);
  const isInCart = useCallback((productId: string) => state.items.some((i) => i.productId === productId), [state.items]);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totals,
        promoCode: state.promoCode,
        promoError: state.promoError,
        shippingMethod: state.shippingMethod,
        isOpen: state.isOpen,
        itemCount,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        applyPromo,
        removePromo,
        setShipping,
        setOpen,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
