/**
 * Store settings shown across the storefront. Phase 4 moves these into the
 * `store_settings` table so the owner edits them from /admin/pengaturan;
 * until then these are the defaults. Contact fields stay empty rather than
 * showing invented details.
 */

export type StoreSettings = {
  name: string;
  tagline: string;
  announcement: { enabled: boolean; text: string };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
  };
  contact: {
    whatsapp: string | null;
    email: string | null;
    address: string | null;
    hours: string | null;
  };
  /** Short service facts shown under the hero. Each must be true for the live store. */
  servicePoints: { title: string; body: string }[];
  social: { instagram: string | null; tiktok: string | null; shopee: string | null };
};

const defaults: StoreSettings = {
  name: "Devina Store",
  tagline: "Alat perawatan & makeup untuk rutinitas harianmu",
  announcement: {
    enabled: true,
    text: "Selamat datang di Devina Store — perawatan wajah, hidung, dan makeup dalam satu tempat.",
  },
  hero: {
    eyebrow: "Perawatan wajah • Hidung • Makeup",
    title: "Rawat diri, mulai dari langkah kecil.",
    subtitle: "Ice roller, nose strip, alat pemancung dan penjepit hidung, sampai makeup favorit dalam satu toko.",
    ctaLabel: "Belanja sekarang",
    ctaHref: "/produk",
  },
  contact: { whatsapp: null, email: null, address: null, hours: null },
  servicePoints: [
    { title: "Kirim ke seluruh Indonesia", body: "Ongkir dihitung otomatis sesuai alamat dan kurir pilihanmu." },
    { title: "Pembayaran via Midtrans", body: "Transfer bank (virtual account). QRIS menyusul setelah aktivasi." },
    { title: "Pesanan bisa dilacak", body: "Status pembayaran dan pengiriman tersedia di akunmu." },
  ],
  social: { instagram: null, tiktok: null, shopee: null },
};

export async function getStoreSettings(): Promise<StoreSettings> {
  return defaults;
}

/** Absolute site URL for canonical links and Open Graph. */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return url.replace(/\/+$/, "");
}
