"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, buttonStyles } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { cn } from "@/lib/cn";
import type { ProductOption } from "@/lib/catalog/types";
import type { EffectivePrice } from "@/lib/pricing";
import { MAX_QTY_PER_LINE } from "@/lib/cart/cart-items";
import { useCart } from "./cart-provider";

/** Variant data prepared on the server; prices are computed there at request time. */
export type PurchasableVariant = {
  id: string;
  sku: string;
  optionValues: Record<string, string>;
  stock: number;
  price: EffectivePrice;
};

export function AddToCart({
  productName,
  options,
  variants,
}: {
  productName: string;
  options: ProductOption[];
  variants: PurchasableVariant[];
}) {
  const cart = useCart();
  const router = useRouter();
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
  const [selection, setSelection] = useState<Record<string, string>>(firstAvailable.optionValues);
  const [quantity, setQuantity] = useState(1);

  const selected = useMemo(
    () => variants.find((v) => options.every((o) => v.optionValues[o.name] === selection[o.name])) ?? null,
    [variants, options, selection],
  );
  const inCart = selected ? (cart.items.find((i) => i.variantId === selected.id)?.quantity ?? 0) : 0;
  const maxAddable = selected ? Math.max(0, Math.min(selected.stock, MAX_QTY_PER_LINE) - inCart) : 0;
  const soldOut = !selected || selected.stock <= 0;

  /** Whether choosing this value (keeping the other choices) leads to a variant in stock. */
  const valueAvailable = (optionName: string, value: string) =>
    variants.some(
      (v) =>
        v.stock > 0 &&
        v.optionValues[optionName] === value &&
        options.every((o) => o.name === optionName || v.optionValues[o.name] === selection[o.name]),
    );

  const handleAdd = () => {
    if (!selected || maxAddable <= 0) return;
    const qty = Math.min(quantity, maxAddable);
    cart.add(selected.id, qty);
    setQuantity(1);
    toast.success("Ditambahkan ke keranjang", {
      description: `${productName}${options.length ? ` · ${Object.values(selected.optionValues).join(" / ")}` : ""} × ${qty}`,
      action: { label: "Lihat", onClick: () => router.push("/keranjang") },
    });
  };

  return (
    <div className="space-y-6">
      {selected ? <Price price={selected.price} size="lg" /> : <p className="text-sm text-ink-600">Pilih varian</p>}

      {options.map((option) => (
        <fieldset key={option.name}>
          <legend className="mb-2.5 text-sm font-medium text-ink-800">
            {option.name}: <span className="font-semibold text-ink-950">{selection[option.name]}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const active = selection[option.name] === value;
              const available = valueAvailable(option.name, value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelection((s) => ({ ...s, [option.name]: value }));
                    setQuantity(1);
                  }}
                  className={cn(
                    "min-h-10 rounded-[var(--radius-control)] border px-4 text-sm font-medium transition-colors",
                    active ? "border-brand-700 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-800 hover:border-ink-300",
                    !available && "text-ink-500 line-through decoration-ink-300",
                  )}
                >
                  {value}
                  {!available && <span className="sr-only"> (stok habis)</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div>
        <p className="mb-2.5 text-sm font-medium text-ink-800">Jumlah</p>
        <div className="flex flex-wrap items-center gap-4">
          <QuantityStepper value={quantity} max={Math.max(1, maxAddable)} onChange={setQuantity} />
          <StockNote stock={selected?.stock ?? 0} inCart={inCart} />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" fullWidth onClick={handleAdd} disabled={soldOut || maxAddable <= 0} className="sm:flex-1">
          {soldOut ? "Stok habis" : maxAddable <= 0 ? "Jumlah maksimal di keranjang" : "Tambah ke keranjang"}
        </Button>
        {inCart > 0 && (
          <Link href="/keranjang" className={buttonStyles({ variant: "outline", size: "lg", className: "sm:flex-none" })}>
            Lihat keranjang ({inCart})
          </Link>
        )}
      </div>
    </div>
  );
}

function StockNote({ stock, inCart }: { stock: number; inCart: number }) {
  if (stock <= 0) return <p className="text-sm font-medium text-danger-700">Stok habis</p>;
  return (
    <p className={cn("text-sm", stock <= 5 ? "font-medium text-warning-700" : "text-ink-600")}>
      {stock <= 5 ? `Sisa ${stock}` : `Stok ${stock}`}
      {inCart > 0 && <span className="text-ink-600"> · {inCart} di keranjang</span>}
    </p>
  );
}
