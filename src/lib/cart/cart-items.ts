/**
 * Guest cart kept in the browser (localStorage). It stores only variant ids
 * and quantities: names, prices, and stock are always re-read from the
 * server, so a tampered cart can never change what a customer pays.
 * Phase 5 adds the account cart in the database and merges this into it.
 */

export type CartItem = { variantId: string; quantity: number };

export const MAX_QTY_PER_LINE = 99;
export const MAX_CART_LINES = 50;
export const CART_STORAGE_KEY = "devina-cart-v1";

function clampQty(n: number): number {
  return Math.min(Math.max(Math.floor(n), 1), MAX_QTY_PER_LINE);
}

export function addItem(items: CartItem[], variantId: string, quantity: number): CartItem[] {
  const existing = items.find((i) => i.variantId === variantId);
  if (existing) {
    return items.map((i) => (i.variantId === variantId ? { ...i, quantity: clampQty(i.quantity + quantity) } : i));
  }
  if (items.length >= MAX_CART_LINES) return items;
  return [...items, { variantId, quantity: clampQty(quantity) }];
}

export function setQuantity(items: CartItem[], variantId: string, quantity: number): CartItem[] {
  if (quantity < 1) return removeItem(items, variantId);
  return items.map((i) => (i.variantId === variantId ? { ...i, quantity: clampQty(quantity) } : i));
}

/** Returns the same array when the variant is not in the cart, so callers can skip no-op updates. */
export function removeItem(items: CartItem[], variantId: string): CartItem[] {
  if (!items.some((i) => i.variantId === variantId)) return items;
  return items.filter((i) => i.variantId !== variantId);
}

export function countItems(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

/** Parse untrusted input (localStorage or a server action argument) into a clean cart. */
export function parseCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const merged = new Map<string, number>();
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const { variantId, quantity } = entry as Record<string, unknown>;
    if (typeof variantId !== "string" || variantId.length === 0 || variantId.length > 100) continue;
    if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity < 1) continue;
    merged.set(variantId, clampQty((merged.get(variantId) ?? 0) + quantity));
    if (merged.size >= MAX_CART_LINES) break;
  }
  return [...merged].map(([variantId, quantity]) => ({ variantId, quantity }));
}
