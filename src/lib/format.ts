const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format an integer Rupiah amount, e.g. 45000 → "Rp 45.000". */
export function formatRupiah(amount: number): string {
  if (!Number.isFinite(amount)) throw new Error(`Invalid amount: ${amount}`);
  // Intl uses a non-breaking space after "Rp"; keep it so the price never wraps.
  return rupiah.format(Math.round(amount));
}

/** Format grams as "250 g" or "1,2 kg". */
export function formatWeight(grams: number): string {
  if (grams < 1000) return `${grams} g`;
  return `${(grams / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`;
}
