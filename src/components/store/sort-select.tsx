"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { catalogHref } from "@/lib/catalog/search-params";
import { PRODUCT_SORTS, type ProductSort } from "@/lib/catalog/types";

export function SortSelect({ basePath, q, value }: { basePath: string; q?: string; value: ProductSort }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <label className="flex items-center gap-2 text-sm text-ink-600">
      <span className="shrink-0">Urutkan</span>
      <select
        value={value}
        aria-busy={pending || undefined}
        onChange={(e) =>
          startTransition(() => router.push(catalogHref(basePath, { q, sort: e.target.value as ProductSort }), { scroll: false }))
        }
        className="h-10 cursor-pointer rounded-[var(--radius-control)] border border-ink-200 bg-surface pr-8 pl-3 text-sm font-medium text-ink-950 hover:border-ink-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
      >
        {PRODUCT_SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
