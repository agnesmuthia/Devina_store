import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { categoryIcon } from "@/components/store/category-icon";
import { ProductGrid, ProductGridSkeleton } from "@/components/store/product-grid";
import { SectionHeading } from "@/components/store/section-heading";
import {
  getBestSellers,
  getFeaturedProducts,
  getNewArrivals,
  getProductsOnSale,
  listTopLevelCategories,
  type Product,
} from "@/lib/catalog";
import { requestNow } from "@/lib/now";
import { getStoreSettings } from "@/lib/store-config";

const serviceIcons = [Truck, ShieldCheck, PackageCheck];

export default async function HomePage() {
  const [settings, categories] = await Promise.all([getStoreSettings(), listTopLevelCategories()]);
  const { hero } = settings;

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pt-10 pb-12 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:pt-16 lg:pb-20">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-brand-700 uppercase">{hero.eyebrow}</p>
          <h1 className="mt-4 max-w-xl font-display text-[40px] leading-[1.05] font-medium tracking-[-0.02em] text-ink-950 sm:text-[56px]">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-lg text-base text-ink-600 sm:text-lg">{hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={hero.ctaHref} className={buttonStyles({ size: "lg" })}>
              {hero.ctaLabel}
            </Link>
            <Link href="#promo" className={buttonStyles({ size: "lg", variant: "outline" })}>
              Lihat promo
            </Link>
          </div>
        </div>

        <nav aria-label="Kategori unggulan" className="rounded-[calc(var(--radius-card)*1.5)] bg-brand-50 p-3 sm:p-4">
          <ul className="grid grid-cols-1 gap-3">
            {categories.map((c) => {
              const Icon = categoryIcon(c.slug);
              return (
                <li key={c.id}>
                  <Link
                    href={`/kategori/${c.slug}`}
                    className="group flex items-center gap-4 rounded-[var(--radius-card)] bg-surface p-4 transition-shadow hover:shadow-[var(--shadow-raised)] sm:p-5"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                      <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink-950">{c.name}</span>
                      <span className="block text-sm text-ink-600">{c.description}</span>
                    </span>
                    <ArrowRight aria-hidden className="size-4 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </section>

      {/* Service facts */}
      <section aria-label="Layanan toko" className="border-y border-ink-100 bg-ink-50/60">
        <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
          {settings.servicePoints.map((point, i) => {
            const Icon = serviceIcons[i % serviceIcons.length];
            return (
              <li key={point.title} className="flex gap-3.5">
                <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-700" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-semibold text-ink-950">{point.title}</p>
                  <p className="mt-0.5 text-sm text-ink-600">{point.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 pt-14 sm:px-6 lg:space-y-20 lg:pt-20">
        <Suspense fallback={<SectionSkeleton title="Sedang promo" />}>
          <ProductSection
            id="promo"
            title="Sedang promo"
            description="Harga spesial selama periode promo berlangsung."
            load={(now) => getProductsOnSale(now, 8)}
            href="/produk"
          />
        </Suspense>
        <Suspense fallback={<SectionSkeleton title="Produk pilihan" />}>
          <ProductSection title="Produk pilihan" load={() => getFeaturedProducts(8)} href="/produk" />
        </Suspense>
        <Suspense fallback={<SectionSkeleton title="Baru datang" />}>
          <ProductSection title="Baru datang" load={() => getNewArrivals(4)} href="/produk?urut=terbaru" />
        </Suspense>
        <Suspense fallback={null}>
          {/* Hidden until there are real paid orders to rank by. */}
          <ProductSection title="Terlaris" description="Berdasarkan penjualan yang sudah dibayar." load={() => getBestSellers(4)} />
        </Suspense>
      </div>
    </>
  );
}

async function ProductSection({
  id,
  title,
  description,
  href,
  load,
}: {
  id?: string;
  title: string;
  description?: string;
  href?: string;
  load: (now: Date) => Promise<Product[]>;
}) {
  const now = await requestNow();
  const products = await load(now);
  if (products.length === 0) return null;
  return (
    <section id={id} aria-label={title} className="scroll-mt-28">
      <SectionHeading title={title} description={description} href={href} />
      <ProductGrid products={products} now={now} />
    </section>
  );
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section aria-label={title}>
      <SectionHeading title={title} />
      <ProductGridSkeleton />
    </section>
  );
}
