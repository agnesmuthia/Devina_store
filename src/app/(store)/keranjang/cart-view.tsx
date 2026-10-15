"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/components/store/cart-provider";
import { ProductImage } from "@/components/store/product-image";
import { resolveCart, type ResolvedCart } from "@/lib/cart/actions";
import { MAX_QTY_PER_LINE } from "@/lib/cart/cart-items";
import { formatRupiah } from "@/lib/format";

export function CartView() {
  const cart = useCart();
  const [resolved, setResolved] = useState<ResolvedCart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [attempt, setAttempt] = useState(0);

  // Re-price on the server whenever the cart changes; the browser never decides prices.
  useEffect(() => {
    if (!cart.ready) return;
    let cancelled = false;
    startTransition(async () => {
      try {
        const result = await resolveCart(cart.items);
        if (cancelled) return;
        setResolved(result);
        setError(null);
      } catch {
        if (!cancelled) setError("Keranjang tidak dapat dimuat. Periksa koneksi lalu coba lagi.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cart.items, cart.ready, attempt]);

  // Drop items whose product no longer exists. Runs once per server response.
  const { remove } = cart;
  useEffect(() => {
    resolved?.missing.forEach((id) => remove(id));
  }, [resolved, remove]);
  const [missingNotice, setMissingNotice] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (resolved && resolved.missing.length > 0) setMissingNotice(true);
  }, [resolved]);

  if (error) {
    return (
      <div className="max-w-lg space-y-4">
        <Alert tone="danger" title="Gagal memuat keranjang">
          {error}
        </Alert>
        <Button variant="outline" onClick={() => setAttempt((n) => n + 1)}>
          Coba lagi
        </Button>
      </div>
    );
  }

  if (!cart.ready || (resolved === null && cart.items.length > 0)) return <CartSkeleton />;

  if (cart.items.length === 0 || !resolved || resolved.lines.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Keranjangmu masih kosong"
        description="Yuk, lihat produk perawatan dan makeup yang tersedia."
        action={
          <Link href="/produk" className={buttonStyles()}>
            Mulai belanja
          </Link>
        }
        className="rounded-[var(--radius-card)] border border-ink-100"
      />
    );
  }

  const hasIssues = resolved.lines.some((l) => l.issue !== null);
  const availableCount = resolved.lines.filter((l) => l.issue === null).reduce((n, l) => n + l.quantity, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <section aria-label="Barang di keranjang">
        {missingNotice && (
          <Alert tone="info" className="mb-4">
            Beberapa produk sudah tidak tersedia dan telah dihapus dari keranjang.
          </Alert>
        )}
        <ul className="divide-y divide-ink-100 border-y border-ink-100" aria-busy={isPending || undefined}>
          {resolved.lines.map((line) => (
            <li key={line.variantId} className="flex gap-4 py-5">
              <Link href={`/produk/${line.productSlug}`} className="w-20 shrink-0 sm:w-24">
                <ProductImage src={line.imageSrc} alt={line.imageAlt} sizes="96px" compact className="rounded-[var(--radius-control)]" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/produk/${line.productSlug}`} className="font-medium text-ink-950 hover:underline">
                      {line.productName}
                    </Link>
                    {line.variantLabel && <p className="text-sm text-ink-600">{line.variantLabel}</p>}
                  </div>
                  <p className="shrink-0 text-right font-semibold text-ink-950 tabular-nums">{formatRupiah(line.lineTotal)}</p>
                </div>
                <p className="mt-1 text-sm text-ink-600 tabular-nums">
                  {formatRupiah(line.unitPrice)}
                  {line.onSale && <span className="ml-2 text-ink-500 line-through">{formatRupiah(line.originalUnitPrice)}</span>}
                </p>

                {line.issue === "out_of_stock" && (
                  <p className="mt-2 text-sm font-medium text-danger-700">Stok habis. Hapus barang ini untuk melanjutkan.</p>
                )}
                {line.issue === "insufficient_stock" && (
                  <p className="mt-2 text-sm font-medium text-warning-700">Stok tersisa {line.stock}. Kurangi jumlahnya.</p>
                )}

                <div className="mt-3 flex items-center gap-3">
                  {line.issue !== "out_of_stock" && (
                    <QuantityStepper
                      size="sm"
                      value={line.quantity}
                      max={Math.min(Math.max(line.stock, 1), MAX_QTY_PER_LINE)}
                      onChange={(q) => cart.setQuantity(line.variantId, q)}
                      label={`Jumlah ${line.productName}`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => cart.remove(line.variantId)}
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] px-2 py-1.5 text-sm text-ink-600 hover:bg-ink-100 hover:text-danger-700"
                  >
                    <Trash2 aria-hidden className="size-4" />
                    Hapus
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside aria-label="Ringkasan belanja" className="rounded-[var(--radius-card)] border border-ink-200 bg-surface p-5 lg:sticky lg:top-36">
        <h2 className="text-base font-semibold text-ink-950">Ringkasan belanja</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-600">Subtotal ({availableCount} barang)</dt>
            <dd className="font-semibold text-ink-950 tabular-nums">{formatRupiah(resolved.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-600">Ongkos kirim</dt>
            <dd className="text-ink-600">Dihitung saat checkout</dd>
          </div>
        </dl>
        <p className="mt-4 border-t border-ink-100 pt-4 text-xs leading-relaxed text-ink-600">
          Harga dan stok diperiksa ulang oleh sistem saat checkout. Total akhir = subtotal − diskon + ongkir.
        </p>
        <Button size="lg" fullWidth className="mt-4" disabled title="Checkout akan tersedia setelah fitur akun dan pembayaran selesai">
          {hasIssues ? "Perbaiki keranjang dulu" : "Checkout"}
        </Button>
        <p className="mt-2 text-center text-xs text-ink-500">Checkout akan aktif setelah fitur akun & pembayaran selesai.</p>
      </aside>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]" aria-busy="true" aria-label="Memuat keranjang">
      <div className="space-y-5">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="size-24 rounded-[var(--radius-control)]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-56 rounded-[var(--radius-card)]" />
    </div>
  );
}
