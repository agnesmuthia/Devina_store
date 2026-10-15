"use server";

import { getVariantsByIds } from "@/lib/catalog";
import { getEffectivePrice } from "@/lib/pricing";
import { parseCart } from "./cart-items";

export type CartLine = {
  variantId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  imageAlt: string;
  imageSrc: string | null;
  unitPrice: number;
  originalUnitPrice: number;
  onSale: boolean;
  quantity: number;
  stock: number;
  lineTotal: number;
  issue: "out_of_stock" | "insufficient_stock" | null;
};

export type ResolvedCart = {
  lines: CartLine[];
  /** Variant ids that no longer exist (deleted or archived products). */
  missing: string[];
  /** Sum of available lines only, computed on the server. */
  subtotal: number;
};

/** Re-price a browser cart from the catalog. The browser's own numbers are never used. */
export async function resolveCart(rawItems: unknown): Promise<ResolvedCart> {
  const items = parseCart(rawItems);
  const lookup = await getVariantsByIds(items.map((i) => i.variantId));
  const now = new Date();

  const lines: CartLine[] = [];
  const missing: string[] = [];
  for (const item of items) {
    const found = lookup.get(item.variantId);
    if (!found) {
      missing.push(item.variantId);
      continue;
    }
    const { product, variant } = found;
    const price = getEffectivePrice(variant, now);
    const issue = variant.stock <= 0 ? "out_of_stock" : item.quantity > variant.stock ? "insufficient_stock" : null;
    lines.push({
      variantId: variant.id,
      productSlug: product.slug,
      productName: product.name,
      variantLabel: variant.label,
      imageAlt: product.images[0]?.alt ?? product.name,
      imageSrc: product.images[0]?.src ?? null,
      unitPrice: price.current,
      originalUnitPrice: price.original,
      onSale: price.onSale,
      quantity: item.quantity,
      stock: variant.stock,
      lineTotal: price.current * item.quantity,
      issue,
    });
  }

  const subtotal = lines.filter((l) => l.issue === null).reduce((sum, l) => sum + l.lineTotal, 0);
  return { lines, missing, subtotal };
}
