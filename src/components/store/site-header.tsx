import Link from "next/link";
import { UserRound } from "lucide-react";
import { listTopLevelCategories } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/store-config";
import { CartButton } from "./cart-button";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { SearchForm } from "./search-form";

export async function SiteHeader() {
  const [settings, categories] = await Promise.all([getStoreSettings(), listTopLevelCategories()]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-8">
        <MobileMenu categories={categories} />
        <Logo name={settings.name} />
        <SearchForm id="search-desktop" className="hidden flex-1 md:block md:max-w-xl" />
        <div className="ml-auto flex items-center gap-1">
          <Link href="/masuk" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-ink-800 hover:bg-ink-100 sm:inline-flex" >
            <UserRound aria-hidden className="size-5" strokeWidth={1.75} />
            Masuk
          </Link>
          <CartButton />
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <SearchForm id="search-mobile" />
      </div>
      <nav aria-label="Kategori" className="hidden border-t border-ink-100 lg:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-7 px-6 text-sm">
          <li>
            <Link href="/produk" className="block py-3 font-semibold text-ink-950 hover:text-brand-700">
              Semua produk
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={`/kategori/${c.slug}`} className="block py-3 text-ink-600 hover:text-brand-700">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
