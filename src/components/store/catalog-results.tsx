import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { queryProducts, type CatalogSearchParams } from "@/lib/catalog";
import { catalogHref, parseCatalogParams } from "@/lib/catalog/search-params";
import { cn } from "@/lib/cn";
import { requestNow } from "@/lib/now";
import { ProductGrid } from "./product-grid";
import { SortSelect } from "./sort-select";

/** Request-time product listing (filters come from the URL; prices depend on the current time). */
export async function CatalogResults({
  basePath,
  searchParams,
  category,
  requireQuery = false,
}: {
  basePath: string;
  searchParams: Promise<CatalogSearchParams>;
  category?: string;
  requireQuery?: boolean;
}) {
  const { sort, page, q } = parseCatalogParams(await searchParams);
  const now = await requestNow();

  if (requireQuery && !q) {
    return (
      <EmptyState
        icon={SearchX}
        title="Mau cari apa hari ini?"
        description="Ketik nama produk, kategori, atau warna di kolom pencarian."
      />
    );
  }

  const result = await queryProducts({ q: q || undefined, category, sort, page }, now);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-600" aria-live="polite">
          {q ? (
            <>
              <span className="font-semibold text-ink-950">{result.total}</span> hasil untuk “{q}”
            </>
          ) : (
            <>
              <span className="font-semibold text-ink-950">{result.total}</span> produk
            </>
          )}
        </p>
        {result.total > 0 && <SortSelect basePath={basePath} q={q || undefined} value={sort} />}
      </div>

      {result.total === 0 ? (
        <EmptyState
          icon={SearchX}
          title={q ? "Produk tidak ditemukan" : "Belum ada produk"}
          description={q ? "Coba kata kunci lain atau lihat semua produk." : "Produk di kategori ini akan segera tersedia."}
          action={
            <Link href="/produk" className={buttonStyles({ variant: "outline" })}>
              Lihat semua produk
            </Link>
          }
        />
      ) : (
        <>
          <ProductGrid products={result.items} now={now} />
          {result.pageCount > 1 && (
            <nav aria-label="Halaman" className="mt-12 flex items-center justify-center gap-2">
              <PageLink disabled={result.page <= 1} href={catalogHref(basePath, { q, sort, page: result.page - 1 })} label="Halaman sebelumnya">
                <ChevronLeft aria-hidden className="size-4" />
              </PageLink>
              <span className="px-3 text-sm text-ink-600">
                Halaman {result.page} dari {result.pageCount}
              </span>
              <PageLink disabled={result.page >= result.pageCount} href={catalogHref(basePath, { q, sort, page: result.page + 1 })} label="Halaman berikutnya">
                <ChevronRight aria-hidden className="size-4" />
              </PageLink>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function PageLink({ href, disabled, label, children }: { href: string; disabled: boolean; label: string; children: React.ReactNode }) {
  const cls = buttonStyles({ variant: "outline", size: "icon" });
  if (disabled) {
    return (
      <span aria-disabled="true" aria-label={label} className={cn(cls, "pointer-events-none opacity-40")}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={cls}>
      {children}
    </Link>
  );
}
