"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";

export function CartButton() {
  const { count, ready } = useCart();
  const label = ready && count > 0 ? `Keranjang, ${count} barang` : "Keranjang";
  return (
    <Link href="/keranjang" aria-label={label} className="relative grid size-10 place-items-center rounded-full text-ink-800 hover:bg-ink-100">
      <ShoppingBag aria-hidden className="size-[22px]" strokeWidth={1.75} />
      {ready && count > 0 && (
        <span aria-hidden className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-brand-700 px-1 text-[11px] leading-5 font-bold text-white tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
