import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { ProductCard } from "./product-card";

const grid = "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4";

export function ProductGrid({ products, now, className }: { products: Product[]; now: Date; className?: string }) {
  return (
    <div className={cn(grid, className)}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} now={now} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={grid} aria-busy="true" aria-label="Memuat produk">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton className="aspect-square rounded-[var(--radius-card)]" />
          <Skeleton className="mt-3 h-4 w-4/5" />
          <Skeleton className="mt-2 h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
