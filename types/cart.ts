export type CartItemType = "part" | "vehicle" | "gear";

export interface CartItem {
  id: string;          // unique cart line id
  productId: string;   // SKU or vehicle ID
  type: CartItemType;
  name: string;
  brand?: string;
  sku?: string;
  image: string;
  price: number;
  quantity: number;
  maxQty?: number;
  color?: string;
  size?: string;       // for gear items
  fitmentNote?: string; // e.g. "Fits: 2023 Can-Am Maverick X3"
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shippingEstimate: number;
  taxRate: number;
  tax: number;
  total: number;
}

export interface PromoCode {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrder?: number;
  description: string;
}

export type ShippingMethod = "standard" | "expedited" | "overnight" | "pickup";

export interface ShippingOption {
  id: ShippingMethod;
  label: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  type: CartItemType;
  name: string;
  image: string;
  price: number;
  addedAt: string;
}

// Checkout multi-step state
export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CheckoutState {
  step: 1 | 2 | 3;
  shippingAddress: Partial<CheckoutAddress>;
  orderNotes: string;
  orderRef?: string;
}
