import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CatalogResults } from "@/components/store/catalog-results";
import { ProductGridSkeleton } from "@/components/store/product-grid";
import { SearchForm } from "@/components/store/search-form";

export const metadata: Metadata = {
  title: "Cari Produk",
  // Search result pages are thin, duplicate content: keep them out of the index but let crawlers follow links.
  robots: { index: false, follow: true },
};

export default function SearchPage({ searchParams }: PageProps<"/cari">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Pencarian" }]} />
      <h1 className="mt-4 font-display text-3xl font-medium text-ink-950 sm:text-4xl">Pencarian</h1>
      <Suspense fallback={<SearchForm id="search-page" className="mt-6 mb-8 max-w-xl" />}>
        <SearchBox searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <CatalogResults basePath="/cari" searchParams={searchParams} requireQuery />
      </Suspense>
    </div>
  );
}

async function SearchBox({ searchParams }: Pick<PageProps<"/cari">, "searchParams">) {
  const raw = (await searchParams).q;
  const q = typeof raw === "string" ? raw : undefined;
  return <SearchForm id="search-page" defaultValue={q} className="mt-6 mb-8 max-w-xl" autoFocus={!q} />;
}
