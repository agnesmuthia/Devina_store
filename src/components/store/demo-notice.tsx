import { CATALOG_IS_DEMO } from "@/lib/catalog";

/** Shown on every storefront page while products are placeholders. */
export function DemoNotice() {
  if (!CATALOG_IS_DEMO) return null;
  return (
    <div className="border-b border-warning-700/15 bg-warning-50 px-4 py-2 text-center text-xs font-medium text-warning-700">
      Mode pratinjau — produk, harga, dan stok di halaman ini adalah contoh.
    </div>
  );
}
