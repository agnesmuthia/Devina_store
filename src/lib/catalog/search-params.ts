import { PRODUCT_SORTS, type ProductSort } from "./types";

export type CatalogSearchParams = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Read catalog filters from the URL, ignoring anything invalid. */
export function parseCatalogParams(params: CatalogSearchParams) {
  const sortRaw = first(params.urut);
  const sort: ProductSort = PRODUCT_SORTS.some((s) => s.value === sortRaw) ? (sortRaw as ProductSort) : "terbaru";
  const page = Math.max(1, Number.parseInt(first(params.hal) ?? "1", 10) || 1);
  const q = (first(params.q) ?? "").trim().slice(0, 100);
  return { sort, page, q };
}

/** Build a catalog URL, dropping default values so links stay clean. */
export function catalogHref(basePath: string, { q, sort, page }: { q?: string; sort?: ProductSort; page?: number }) {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (sort && sort !== "terbaru") sp.set("urut", sort);
  if (page && page > 1) sp.set("hal", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
