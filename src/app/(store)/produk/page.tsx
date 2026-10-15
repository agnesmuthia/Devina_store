import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CatalogResults } from "@/components/store/catalog-results";
import { ProductGridSkeleton } from "@/components/store/product-grid";
import { listTopLevelCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Semua Produk",
  description: "Lihat semua produk perawatan wajah, perawatan hidung, dan makeup di Devina Store.",
  alternates: { canonical: "/produk" },
};

export default async function CatalogPage({ searchParams }: PageProps<"/produk">) {
  const categories = await listTopLevelCategories();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Semua produk" }]} />
      <h1 className="mt-4 font-display text-3xl font-medium text-ink-950 sm:text-4xl">Semua produk</h1>
      <CategoryChips categories={categories} />
      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <CatalogResults basePath="/produk" searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function CategoryChips({ categories }: { categories: { id: string; slug: string; name: string }[] }) {
  const chip = "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors";
  return (
    <nav aria-label="Filter kategori" className="-mx-4 mt-6 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-2">
        <li>
          <span aria-current="page" className={`${chip} border-ink-950 bg-ink-950 text-white`}>
            Semua
          </span>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={`/kategori/${c.slug}`} className={`${chip} border-ink-200 text-ink-800 hover:border-ink-300 hover:bg-ink-50`}>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
