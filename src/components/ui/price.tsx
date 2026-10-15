import { formatRupiah } from "@/lib/format";
import type { EffectivePrice } from "@/lib/pricing";
import { cn } from "@/lib/cn";

/** Current price with the struck-through original and discount when on sale. */
export function Price({
  price,
  size = "md",
  showFrom = false,
  className,
}: {
  price: EffectivePrice;
  size?: "md" | "lg";
  showFrom?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-bold text-ink-950 tabular-nums", size === "lg" ? "text-2xl" : "text-base")}>
        {showFrom && <span className="mr-1 text-xs font-medium text-ink-600">mulai</span>}
        {formatRupiah(price.current)}
      </span>
      {price.onSale && (
        <>
          <span className={cn("text-ink-500 line-through tabular-nums", size === "lg" ? "text-base" : "text-xs")}>
            <span className="sr-only">Harga normal </span>
            {formatRupiah(price.original)}
          </span>
          <span className={cn("font-semibold text-brand-700", size === "lg" ? "text-sm" : "text-xs")}>
            -{price.discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}
