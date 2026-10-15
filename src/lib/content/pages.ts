/**
 * Policy and help pages. Phase 9 stores these in the `content_pages` table,
 * edited by the owner in admin. Until then each page says honestly that its
 * content is being prepared — no invented return windows or promises.
 */

export type ContentPage = { slug: string; title: string; description: string };

export const policyPages: ContentPage[] = [
  { slug: "pengiriman", title: "Kebijakan Pengiriman", description: "Informasi kurir, estimasi, dan biaya pengiriman." },
  { slug: "pembatalan", title: "Kebijakan Pembatalan", description: "Ketentuan pembatalan pesanan." },
  { slug: "pengembalian", title: "Kebijakan Pengembalian", description: "Ketentuan retur dan pengembalian dana." },
  { slug: "privasi", title: "Kebijakan Privasi", description: "Cara kami mengumpulkan, menggunakan, dan melindungi data pribadimu." },
  { slug: "syarat-ketentuan", title: "Syarat & Ketentuan", description: "Ketentuan penggunaan situs dan pembelian di toko ini." },
];

export function getPolicyPage(slug: string): ContentPage | null {
  return policyPages.find((p) => p.slug === slug) ?? null;
}
