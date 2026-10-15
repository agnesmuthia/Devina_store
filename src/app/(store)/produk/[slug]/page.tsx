import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MessageSquareText } from "lucide-react";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AddToCart, type PurchasableVariant } from "@/components/store/add-to-cart";
import { ProductGrid, ProductGridSkeleton } from "@/components/store/product-grid";
import { ProductImage } from "@/components/store/product-image";
import { SectionHeading } from "@/components/store/section-heading";
import { getCategory, getProductBySlug, listProductSlugs, queryProducts, type Product } from "@/lib/catalog";
import { formatWeight } from "@/lib/format";
import { requestNow } from "@/lib/now";
import { getEffectivePrice } from "@/lib/pricing";

export async function generateStaticParams() {
  return (await listProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/produk/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Produk tidak ditemukan" };
  const description = product.seoDescription ?? product.shortDescription;
  return {
    title: product.seoTitle ?? product.name,
    description,
    alternates: { canonical: `/produk/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: product.images.filter((i) => i.src).map((i) => ({ url: i.src as string, alt: i.alt })),
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/produk/[slug]">) {
  // Resolved before any streaming starts so an unknown slug returns a real HTTP 404.
  // Known slugs are prerendered (generateStaticParams); only prices stream at request time.
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      <ProductDetail product={product} />
    </div>
  );
}

async function ProductDetail({ product }: { product: Product }) {
  const category = await getCategory(product.categorySlug);
  const parent = category?.parentSlug ? await getCategory(category.parentSlug) : null;
  const crumbs: Crumb[] = [{ label: "Beranda", href: "/" }];
  if (parent) crumbs.push({ label: parent.name, href: `/kategori/${parent.slug}` });
  if (category) crumbs.push({ label: category.name, href: `/kategori/${category.slug}` });
  crumbs.push({ label: product.name });

  const [mainImage, ...moreImages] = product.images;

  return (
    <>
      <Breadcrumbs items={crumbs} />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div>
          <ProductImage
            src={mainImage?.src ?? null}
            alt={mainImage?.alt ?? product.name}
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
          {moreImages.length > 0 && (
            <ul className="mt-3 grid grid-cols-5 gap-2">
              {moreImages.map((img, i) => (
                <li key={i}>
                  <ProductImage src={img.src} alt={img.alt} sizes="20vw" compact className="rounded-[var(--radius-control)]" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Buy box */}
        <div className="lg:pt-2">
          {category && (
            <Link href={`/kategori/${category.slug}`} className="text-xs font-semibold tracking-[0.14em] text-brand-700 uppercase hover:underline">
              {category.name}
            </Link>
          )}
          <h1 className="mt-2 font-display text-3xl leading-tight font-medium text-ink-950 sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-ink-600">{product.shortDescription}</p>
          <p className="mt-2 text-sm text-ink-500">Belum ada ulasan</p>

          <div className="mt-6 border-t border-ink-100 pt-6">
            <Suspense fallback={<BuyBoxSkeleton />}>
              <BuyBox product={product} />
            </Suspense>
          </div>

          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-ink-100 pt-6 text-sm">
            <dt className="text-ink-600">Berat</dt>
            <dd className="text-ink-950">{formatWeight(product.weightGrams)}</dd>
            {product.variants.length === 1 && (
              <>
                <dt className="text-ink-600">SKU</dt>
                <dd className="text-ink-950">{product.variants[0].sku}</dd>
              </>
            )}
            <dt className="text-ink-600">Pengiriman</dt>
            <dd className="text-ink-950">Ongkir dihitung saat checkout sesuai alamat dan kurir.</dd>
          </dl>
        </div>
      </div>

      {/* Description & reviews */}
      <div className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <section aria-labelledby="deskripsi">
          <h2 id="deskripsi" className="font-display text-2xl font-medium text-ink-950">
            Deskripsi produk
          </h2>
          <div className="mt-4 max-w-prose space-y-4 text-ink-800">
            {product.description.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>
        <section aria-labelledby="ulasan">
          <h2 id="ulasan" className="font-display text-2xl font-medium text-ink-950">
            Ulasan pembeli
          </h2>
          <EmptyState
            icon={MessageSquareText}
            title="Belum ada ulasan"
            description="Ulasan hanya bisa ditulis oleh pembeli yang pesanannya sudah diterima."
            className="mt-4 rounded-[var(--radius-card)] border border-dashed border-ink-200 py-10"
          />
        </section>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <RelatedProducts product={product} />
      </Suspense>
    </>
  );
}

async function BuyBox({ product }: { product: Product }) {
  const now = await requestNow();
  const variants: PurchasableVariant[] = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    optionValues: v.optionValues,
    stock: v.stock,
    price: getEffectivePrice(v, now),
  }));
  return <AddToCart productName={product.name} options={product.options} variants={variants} />;
}

async function RelatedProducts({ product }: { product: Product }) {
  const now = await requestNow();
  const related = (await queryProducts({ category: product.categorySlug, pageSize: 5 }, now)).items
    .filter((p) => p.id !== product.id)
    .slice(0, 4);
  if (related.length === 0) return null;
  return (
    <section aria-label="Produk serupa" className="mt-16">
      <SectionHeading title="Produk serupa" href={`/kategori/${product.categorySlug}`} />
      <ProductGrid products={related} now={now} />
    </section>
  );
}

function BuyBoxSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
