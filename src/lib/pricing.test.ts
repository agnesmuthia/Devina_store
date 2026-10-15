import { describe, expect, it } from "vitest";
import { getEffectivePrice, getPriceRange, isSaleActive, type PriceSource } from "./pricing";

const base: PriceSource = { price: 45000, salePrice: null, saleStartsAt: null, saleEndsAt: null };
const now = new Date("2026-10-15T10:00:00+07:00");

describe("isSaleActive", () => {
  it("is false without a sale price", () => {
    expect(isSaleActive(base, now)).toBe(false);
  });

  it("is true for an open-ended sale", () => {
    expect(isSaleActive({ ...base, salePrice: 39000 }, now)).toBe(true);
  });

  it("respects the start date", () => {
    expect(isSaleActive({ ...base, salePrice: 39000, saleStartsAt: "2026-10-16T00:00:00+07:00" }, now)).toBe(false);
  });

  it("treats the end date as exclusive", () => {
    const sale = { ...base, salePrice: 39000, saleEndsAt: "2026-10-15T10:00:00+07:00" };
    expect(isSaleActive(sale, now)).toBe(false);
    expect(isSaleActive(sale, new Date("2026-10-15T09:59:59+07:00"))).toBe(true);
  });

  it("ignores a sale price that is not lower than the regular price", () => {
    expect(isSaleActive({ ...base, salePrice: 45000 }, now)).toBe(false);
    expect(isSaleActive({ ...base, salePrice: 50000 }, now)).toBe(false);
  });

  it("ignores zero, negative, or fractional sale prices", () => {
    expect(isSaleActive({ ...base, salePrice: 0 }, now)).toBe(false);
    expect(isSaleActive({ ...base, salePrice: -1 }, now)).toBe(false);
    expect(isSaleActive({ ...base, salePrice: 39000.5 }, now)).toBe(false);
  });
});

describe("getEffectivePrice", () => {
  it("returns the regular price when not on sale", () => {
    expect(getEffectivePrice(base, now)).toEqual({ current: 45000, original: 45000, onSale: false, discountPercent: 0 });
  });

  it("rounds the discount percentage down", () => {
    // (45000 - 39000) / 45000 = 13.33% → 13
    expect(getEffectivePrice({ ...base, salePrice: 39000 }, now)).toEqual({
      current: 39000,
      original: 45000,
      onSale: true,
      discountPercent: 13,
    });
  });

  it("rejects invalid regular prices", () => {
    expect(() => getEffectivePrice({ ...base, price: -100 }, now)).toThrow();
    expect(() => getEffectivePrice({ ...base, price: 10.5 }, now)).toThrow();
  });
});

describe("getPriceRange", () => {
  it("returns min, max, and the cheapest variant's price", () => {
    const range = getPriceRange([{ ...base, price: 59000 }, { ...base, salePrice: 39000 }, base], now);
    expect(range.min).toBe(39000);
    expect(range.max).toBe(59000);
    expect(range.from.original).toBe(45000);
    expect(range.maxDiscountPercent).toBe(13);
  });

  it("requires at least one variant", () => {
    expect(() => getPriceRange([], now)).toThrow();
  });
});
