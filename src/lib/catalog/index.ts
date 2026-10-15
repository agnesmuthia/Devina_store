import { getEffectivePrice, getPriceRange, type EffectivePrice } from "@/lib/pricing";
import { demoCategories, demoProducts } from "./demo-data";
import type { Category, Product, ProductSort, ProductVariant } from "./types";

export * from "./types";
export type { CatalogSearchParams } from "./search-params";

/**
 * Catalog data access. Phase 2 reads the in-memory demo catalog; Phase 4
 * replaces the bodies of these functions with Supabase queries. Pages only
 * import from here, never from demo-data directly.
 */

/** True while the storefront shows placeholder products instead of the database. */
export const CATALOG_IS_DEMO = true;

const categories = demoCategories;
const products = demoProducts;

export async function listCategories(): Promise<Category[]> {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listTopLevelCategories(): Promise<Category[]> {
  return (await listCategories()).filter((c) => c.parentSlug === null);
}

export async function getCategory(slug: string): Promise<Category | null> {
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getSubcategories(slug: string): Promise<Category[]> {
  return (await listCategories()).filter((c) => c.parentSlug === slug);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug) ?? null;
}

export async function listProductSlugs(): Promise<string[]> {
  return products.map((p) => p.slug);
}

export type ProductQuery = {
  q?: string;
  category?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

export type ProductPage = {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
};

export async function queryProducts(query: ProductQuery, now: Date): Promise<ProductPage> {
  return filterAndSortProducts(products, categories, query, now);
}

export async function getFeaturedProducts(limit: number): Promise<Product[]> {
  return products.filter((p) => p.isFeatured).slice(0, limit);
}

export async function getNewArrivals(limit: number): Promise<Product[]> {
  return [...products].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, limit);
}

export async function getProductsOnSale(now: Date, limit: number): Promise<Product[]> {
  return products
    .filter((p) => p.variants.some((v) => getEffectivePrice(v, now).onSale))
    .slice(0, limit);
}

/**
 * Best sellers come only from real paid orders. There are no orders yet, so
 * this returns an empty list and the homepage hides the section.
 */
export async function getBestSellers(limit: number): Promise<Product[]> {
  void limit;
  return [];
}

export type VariantLookup = { product: Product; variant: ProductVariant };

export async function getVariantsByIds(ids: string[]): Promise<Map<string, VariantLookup>> {
  const wanted = new Set(ids);
  const found = new Map<string, VariantLookup>();
  for (const product of products) {
    for (const variant of product.variants) {
      if (wanted.has(variant.id)) found.set(variant.id, { product, variant });
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// Pure helpers (exported for tests)
// ---------------------------------------------------------------------------

/** Lowercase and strip accents so "Créme" matches "creme". */
export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Every word of the query must appear in the product's name, description, category, or SKU. */
export function matchesSearch(product: Product, categoryName: string, q: string): boolean {
  const terms = normalizeSearchText(q).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalizeSearchText(
    [product.name, product.shortDescription, categoryName, ...product.variants.map((v) => `${v.sku} ${v.label}`)].join(
      " ",
    ),
  );
  return terms.every((t) => haystack.includes(t));
}

/** Slugs of a category and all of its descendants. */
export function categoryWithDescendants(slug: string, all: Category[]): Set<string> {
  const result = new Set([slug]);
  let added = true;
  while (added) {
    added = false;
    for (const c of all) {
      if (c.parentSlug && result.has(c.parentSlug) && !result.has(c.slug)) {
        result.add(c.slug);
        added = true;
      }
    }
  }
  return result;
}

export function filterAndSortProducts(
  allProducts: Product[],
  allCategories: Category[],
  { q, category, sort = "terbaru", page = 1, pageSize = 24 }: ProductQuery,
  now: Date,
): ProductPage {
  const categoryNames = new Map(allCategories.map((c) => [c.slug, c.name]));
  const inCategory = category ? categoryWithDescendants(category, allCategories) : null;

  const filtered = allProducts.filter(
    (p) =>
      (!inCategory || inCategory.has(p.categorySlug)) &&
      (!q || matchesSearch(p, categoryNames.get(p.categorySlug) ?? "", q)),
  );

  const minPrice = (p: Product) => getPriceRange(p.variants, now).min;
  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "harga-terendah":
        return minPrice(a) - minPrice(b);
      case "harga-tertinggi":
        return minPrice(b) - minPrice(a);
      case "nama":
        return a.name.localeCompare(b.name, "id");
      case "terbaru":
      default:
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    }
  });

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const start = (safePage - 1) * pageSize;
  return { items: sorted.slice(start, start + pageSize), total: sorted.length, page: safePage, pageCount };
}

export type { EffectivePrice };
