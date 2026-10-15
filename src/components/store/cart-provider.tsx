"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  addItem as addToItems,
  CART_STORAGE_KEY,
  countItems,
  parseCart,
  removeItem as removeFromItems,
  setQuantity as setItemQuantity,
  type CartItem,
} from "@/lib/cart/cart-items";

type CartContextValue = {
  items: CartItem[];
  /** False until the saved cart has been read from this browser. */
  ready: boolean;
  count: number;
  add: (variantId: string, quantity: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? parseCart(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: CartItem[]) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage can be unavailable (private mode, quota). The cart still works for this visit.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Reading localStorage must wait until after hydration so server and client HTML match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readStorage());
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) setItems(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((fn: (prev: CartItem[]) => CartItem[]) => {
    setItems((prev) => {
      const next = fn(prev);
      if (next === prev) return prev;
      writeStorage(next);
      return next;
    });
  }, []);

  // Stable callbacks: consumers may list them as effect dependencies.
  const add = useCallback((variantId: string, quantity: number) => update((prev) => addToItems(prev, variantId, quantity)), [update]);
  const setQuantity = useCallback(
    (variantId: string, quantity: number) => update((prev) => setItemQuantity(prev, variantId, quantity)),
    [update],
  );
  const remove = useCallback((variantId: string) => update((prev) => removeFromItems(prev, variantId)), [update]);

  const value = useMemo<CartContextValue>(
    () => ({ items, ready, count: countItems(items), add, setQuantity, remove }),
    [items, ready, add, setQuantity, remove],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
