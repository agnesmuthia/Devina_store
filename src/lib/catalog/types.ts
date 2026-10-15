import type { PriceSource } from "@/lib/pricing";

/**
 * Catalog shapes used by the storefront. They mirror the planned database
 * tables (categories, products, product_variants, product_images) so the
 * demo source can be swapped for Supabase in Phase 4 without touching pages.
 */

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  parentSlug: string | null;
  sortOrder: number;
};

export type ProductImage = {
  /** Public image URL, or null when the owner has not uploaded a photo yet. */
  src: string | null;
  alt: string;
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type ProductVariant = PriceSource & {
  id: string;
  sku: string;
  /** Human label, e.g. "Rosewood" or "Isi 12". Empty for single-variant products. */
  label: string;
  /** Option name → value, e.g. { Warna: "Pink" }. */
  optionValues: Record<string, string>;
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  shortDescription: string;
  /** Paragraphs of description text. Becomes sanitized rich text in Phase 4. */
  description: string[];
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  weightGrams: number;
  isFeatured: boolean;
  createdAt: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type ProductSort = "terbaru" | "harga-terendah" | "harga-tertinggi" | "nama";

export const PRODUCT_SORTS: { value: ProductSort; label: string }[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "harga-terendah", label: "Harga terendah" },
  { value: "harga-tertinggi", label: "Harga tertinggi" },
  { value: "nama", label: "Nama A–Z" },
];

export function totalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function isOutOfStock(product: Product): boolean {
  return totalStock(product) <= 0;
}
