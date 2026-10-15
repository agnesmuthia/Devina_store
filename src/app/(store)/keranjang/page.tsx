import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CartView } from "./cart-view";

export const metadata: Metadata = {
  title: "Keranjang",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Keranjang" }]} />
      <h1 className="mt-4 mb-8 font-display text-3xl font-medium text-ink-950 sm:text-4xl">Keranjang</h1>
      <CartView />
    </div>
  );
}
