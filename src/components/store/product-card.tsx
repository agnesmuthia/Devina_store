import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { isOutOfStock, totalStock, type Product } from "@/lib/catalog";
import { getPriceRange } from "@/lib/pricing";
import { ProductImage } from "./product-image";

export const LOW_STOCK_THRESHOLD = 5;

export function ProductCard({ product, now }: { product: Product; now: Date }) {
  const range = getPriceRange(product.variants, now);
  const soldOut = isOutOfStock(product);
  const stock = totalStock(product);
  const image = product.images[0];

  return (
    <article className="group relative flex flex-col">
      <div className="relative">
        <ProductImage
          src={image?.src ?? null}
          alt={image?.alt ?? product.name}
          className="transition-transform duration-300 group-hover:scale-[1.015]"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1">
          {soldOut ? (
            <Badge tone="neutral">Stok habis</Badge>
          ) : range.maxDiscountPercent > 0 ? (
            <Badge tone="sale">Hemat {range.maxDiscountPercent}%</Badge>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <h3 className="line-clamp-2 text-sm leading-snug font-medium text-ink-950">
          <Link href={`/produk/${product.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        <Price price={range.from} showFrom={range.min !== range.max} className="mt-1.5" />
        {!soldOut && stock <= LOW_STOCK_THRESHOLD && (
          <p className="mt-1 text-xs font-medium text-warning-700">Sisa {stock}</p>
        )}
      </div>
    </article>
  );
}
