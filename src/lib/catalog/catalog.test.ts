import { describe, expect, it } from "vitest";
import { demoCategories, demoProducts } from "./demo-data";
import { categoryWithDescendants, filterAndSortProducts, matchesSearch, normalizeSearchText } from "./index";

const now = new Date("2026-10-15T10:00:00+07:00");
const query = (q: Parameters<typeof filterAndSortProducts>[2]) =>
  filterAndSortProducts(demoProducts, demoCategories, q, now);

describe("search", () => {
  it("normalizes case and accents", () => {
    expect(normalizeSearchText("  CRÈME Brûlée ")).toBe("creme brulee");
  });

  it("requires every term to match", () => {
    const roller = demoProducts.find((p) => p.slug === "ice-roller-wajah")!;
    expect(matchesSearch(roller, "Perawatan Wajah", "roller wajah")).toBe(true);
    expect(matchesSearch(roller, "Perawatan Wajah", "roller hidung")).toBe(false);
  });

  it("matches category names and variant labels", () => {
    expect(query({ q: "hidung" }).items.map((p) => p.slug)).toEqual(
      expect.arrayContaining(["nose-strip-pembersih-komedo", "alat-pemancung-hidung", "penjepit-hidung-silikon"]),
    );
    expect(query({ q: "rosewood" }).items.map((p) => p.slug)).toEqual(["lip-cream-matte"]);
  });

  it("returns nothing for unknown terms", () => {
    expect(query({ q: "sepatu" }).total).toBe(0);
  });
});

describe("categories", () => {
  it("includes subcategories of a parent", () => {
    expect([...categoryWithDescendants("makeup", demoCategories)].sort()).toEqual([
      "makeup",
      "makeup-bibir",
      "makeup-wajah",
    ]);
  });

  it("filters products by a parent category", () => {
    expect(query({ category: "makeup" }).items.map((p) => p.slug).sort()).toEqual([
      "cushion-foundation",
      "lip-cream-matte",
    ]);
  });
});

describe("sorting and paging", () => {
  it("sorts by the current (sale-aware) lowest price", () => {
    const prices = query({ sort: "harga-terendah" }).items.map((p) => p.slug);
    expect(prices[0]).toBe("penjepit-hidung-silikon"); // 20.000
    expect(prices.at(-1)).toBe("cushion-foundation"); // 79.000 on sale
  });

  it("sorts newest first by default", () => {
    expect(query({}).items[0].slug).toBe("cushion-foundation");
  });

  it("clamps out-of-range pages", () => {
    const result = query({ page: 99, pageSize: 4 });
    expect(result.page).toBe(2);
    expect(result.pageCount).toBe(2);
    expect(result.items).toHaveLength(2);
  });
});

describe("demo data integrity", () => {
  it("has unique SKUs, slugs, and variant ids", () => {
    const skus = demoProducts.flatMap((p) => p.variants.map((v) => v.sku));
    const ids = demoProducts.flatMap((p) => p.variants.map((v) => v.id));
    expect(new Set(skus).size).toBe(skus.length);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(demoProducts.map((p) => p.slug)).size).toBe(demoProducts.length);
  });

  it("never has negative stock and every product belongs to a known category", () => {
    const slugs = new Set(demoCategories.map((c) => c.slug));
    for (const p of demoProducts) {
      expect(slugs.has(p.categorySlug)).toBe(true);
      for (const v of p.variants) expect(v.stock).toBeGreaterThanOrEqual(0);
    }
  });
});
