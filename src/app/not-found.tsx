import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-display text-6xl font-medium text-brand-700">404</p>
      <h1 className="mt-4 text-xl font-semibold text-ink-950">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-ink-600">Halaman yang kamu cari mungkin sudah dipindahkan atau tidak tersedia.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className={buttonStyles()}>
          Ke beranda
        </Link>
        <Link href="/produk" className={buttonStyles({ variant: "outline" })}>
          Lihat produk
        </Link>
      </div>
    </main>
  );
}
