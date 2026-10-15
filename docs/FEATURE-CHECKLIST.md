# Checklist Fitur — Devina Store

Legenda:
- ✅ **Selesai & teruji**: berfungsi dan punya tes otomatis.
- 🔑 **Menunggu kredensial**: kode siap, butuh akun/kunci eksternal.
- 🧪 **Demo**: tampilan berfungsi dengan data contoh, belum terhubung ke data asli.
- ⬜ **Belum dikerjakan**.

Terakhir diperbarui: Phase 2.

## Fondasi
| Fitur | Status | Catatan |
|---|---|---|
| Proyek Next.js + TypeScript + Tailwind | ✅ | Next.js 16 dengan Cache Components |
| Design system (token, tombol, form, badge, kartu, dialog, tabel, notifikasi, state loading/kosong/error) | ✅ | Lihat `/desain` |
| Layout responsif mobile-first | ✅ | Tes E2E: tidak ada scroll samping di ponsel |
| CI GitHub Actions (lint, typecheck, unit, build, E2E) | ✅ | `.github/workflows/ci.yml` |
| `.env.example` tanpa rahasia | ✅ | |
| README Bahasa Indonesia | 🧪 | Bagian database, pembayaran, ongkir, deploy ditulis di phase terkait |

## Toko (pembeli)
| Fitur | Status | Catatan |
|---|---|---|
| Beranda (banner pengumuman, hero, kategori, promo, pilihan, terbaru) | 🧪 | Konten dari `store-config.ts`; editor admin di Phase 4 |
| Bagian "Terlaris" dari penjualan asli | ✅ | Disembunyikan selama belum ada pesanan dibayar (teruji) |
| Katalog, urutkan, halaman | 🧪 | Logika teruji; data contoh |
| Halaman kategori + subkategori | 🧪 | |
| Pencarian | 🧪 | Logika teruji; tidak diindeks Google |
| Detail produk (varian, stok, harga promo) | 🧪 | |
| Keranjang tamu (browser) + hitung ulang harga di server | ✅ | Tahan manipulasi harga dari browser (teruji). Keranjang akun di Phase 5 |
| Halaman 404 dengan status HTTP benar | ✅ | |
| FAQ, kontak, halaman kebijakan | 🧪 | Teks "sedang disiapkan"; tidak ada kebijakan karangan |
| Registrasi, login, lupa password | ⬜ | Phase 3 |
| Profil & buku alamat | ⬜ | Phase 3 |
| Wishlist | ⬜ | Phase 5 |
| Checkout | ⬜ | Phase 5 (tombol dinonaktifkan) |
| Riwayat & detail pesanan, pelacakan | ⬜ | Phase 8 |
| Ulasan produk | ⬜ | Phase 9 (empty state jujur sudah ada) |

## Admin
| Fitur | Status | Catatan |
|---|---|---|
| Login admin terverifikasi server | ⬜ | Phase 3 |
| Editor produk, kategori, stok, promo, CSV | ⬜ | Phase 4 |
| Pengaturan toko & editor beranda | ⬜ | Phase 4 |
| Manajemen pesanan | ⬜ | Phase 8 |
| Moderasi ulasan | ⬜ | Phase 9 |
| Dashboard ringkasan penjualan | ⬜ | Phase 8 |

## Integrasi
| Fitur | Status | Catatan |
|---|---|---|
| Supabase (database, auth, storage) | ⬜ | Phase 3 |
| Biteship: ongkir | ⬜ | Phase 6 |
| Biteship: pelacakan | ⬜ | Phase 8 |
| Midtrans Snap: virtual account (sandbox) | ⬜ | Phase 7 |
| Midtrans: QRIS dinamis | ⬜ | Setelah GoPay aktif |
| Webhook Midtrans (verifikasi signature, idempotensi) | ⬜ | Phase 7 |

## SEO
| Fitur | Status | Catatan |
|---|---|---|
| Judul & meta description per halaman | 🧪 | Dari data contoh; bisa diedit di admin pada Phase 4 |
| Canonical URL | ✅ | |
| robots.txt (blokir area privat) | ✅ | Teruji |
| Breadcrumb | ✅ | |
| sitemap.xml, structured data (Product, Offer, BreadcrumbList, Organization), redirect slug | ⬜ | Phase 9 |
