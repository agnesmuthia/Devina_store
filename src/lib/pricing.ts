/**
 * Price rules shared by the storefront and (from Phase 5) the server-side
 * checkout. All amounts are integer Rupiah.
 */

export type PriceSource = {
  /** Regular price. */
  price: number;
  /** Promotional price, only valid when lower than `price`. */
  salePrice: number | null;
  /** ISO timestamp; promotion is inactive before this moment. `null` = no start limit. */
  saleStartsAt: string | null;
  /** ISO timestamp; promotion is inactive from this moment on. `null` = no end limit. */
  saleEndsAt: string | null;
};

export type EffectivePrice = {
  /** What the customer pays per unit right now. */
  current: number;
  /** Regular price (shown struck through when on sale). */
  original: number;
  onSale: boolean;
  /** Whole-number percentage, rounded down so the discount is never overstated. */
  discountPercent: number;
};

export function isSaleActive(source: PriceSource, now: Date): boolean {
  const { price, salePrice, saleStartsAt, saleEndsAt } = source;
  if (salePrice === null) return false;
  if (!Number.isInteger(salePrice) || salePrice <= 0 || salePrice >= price) return false;

  const t = now.getTime();
  if (saleStartsAt !== null && t < Date.parse(saleStartsAt)) return false;
  if (saleEndsAt !== null && t >= Date.parse(saleEndsAt)) return false;
  return true;
}

export function getEffectivePrice(source: PriceSource, now: Date): EffectivePrice {
  if (!Number.isInteger(source.price) || source.price < 0) {
    throw new Error(`Invalid price: ${source.price}`);
  }

  if (!isSaleActive(source, now)) {
    return { current: source.price, original: source.price, onSale: false, discountPercent: 0 };
  }

  const current = source.salePrice as number;
  const discountPercent = Math.floor(((source.price - current) / source.price) * 100);
  return { current, original: source.price, onSale: true, discountPercent };
}

/** Lowest and highest current price across variants, for "Rp 39.000 – Rp 59.000" displays. */
export function getPriceRange(sources: PriceSource[], now: Date) {
  if (sources.length === 0) throw new Error("A product needs at least one variant");
  const prices = sources.map((s) => getEffectivePrice(s, now));
  const min = prices.reduce((a, b) => (b.current < a.current ? b : a));
  const max = prices.reduce((a, b) => (b.current > a.current ? b : a));
  return {
    min: min.current,
    max: max.current,
    /** The price shown on a product card: the cheapest variant, with its own original price. */
    from: min,
    maxDiscountPercent: Math.max(...prices.map((p) => p.discountPercent)),
  };
}
