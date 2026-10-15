import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { CatalogResults } from "@/components/store/catalog-results";
import { ProductGridSkeleton } from "@/components/store/product-grid";
import { getCategory, getSubcategories, listCategories, type Category } from "@/lib/catalog";

export async function generateStaticParams() {
  return (await listCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/kategori/[slug]">): Promise<Metadata> {
  const category = await getCategory((await params).slug);
  if (!category) return { title: "Kategori tidak ditemukan" };
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/kategori/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/kategori/[slug]">) {
  // Resolved before streaming so an unknown slug returns a real HTTP 404.
  const category = await getCategory((await params).slug);
  if (!category) notFound();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <CategoryHeader category={category} />
      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <CatalogResults basePath={`/kategori/${category.slug}`} category={category.slug} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CategoryHeader({ category }: { category: Category }) {
  const [parent, children] = await Promise.all([
    category.parentSlug ? getCategory(category.parentSlug) : null,
    getSubcategories(category.slug),
  ]);

  const crumbs: Crumb[] = [{ label: "Beranda", href: "/" }, { label: "Produk", href: "/produk" }];
  if (parent) crumbs.push({ label: parent.name, href: `/kategori/${parent.slug}` });
  crumbs.push({ label: category.name });

  const chip = "shrink-0 rounded-full border border-ink-200 px-4 py-2 text-sm font-medium text-ink-800 hover:border-ink-300 hover:bg-ink-50";
  return (
    <header className="mb-8">
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-4 font-display text-3xl font-medium text-ink-950 sm:text-4xl">{category.name}</h1>
      {category.description && <p className="mt-2 max-w-2xl text-ink-600">{category.description}</p>}
      {children.length > 0 && (
        <nav aria-label={`Subkategori ${category.name}`} className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-2">
            {children.map((c) => (
              <li key={c.id}>
                <Link href={`/kategori/${c.slug}`} className={chip}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
