import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

/** Plain GET form so search works before JavaScript loads. */
export function SearchForm({
  id = "search-header",
  defaultValue,
  className,
  autoFocus,
}: {
  id?: string;
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <form action="/cari" method="get" role="search" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Cari produk
      </label>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-500" />
      <input
        id={id}
        type="search"
        name="q"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Cari ice roller, nose strip, lip cream…"
        autoComplete="off"
        enterKeyHint="search"
        maxLength={100}
        className="h-11 w-full rounded-full border border-ink-200 bg-ink-50 pr-4 pl-10 text-[15px] placeholder:text-ink-500 transition-colors hover:border-ink-300 focus:border-brand-600 focus:bg-surface focus:ring-2 focus:ring-brand-100 focus:outline-none"
      />
    </form>
  );
}
