# Devina Store

Toko online untuk produk perawatan wajah, perawatan hidung, dan makeup. Dibangun dengan Next.js, TypeScript, dan Tailwind CSS. Pemilik toko nantinya mengelola semuanya lewat dashboard admin, tanpa perlu mengubah kode.

> **Status saat ini: Phase 2 dari 10 — tampilan toko & design system.**
> Produk yang tampil masih **data contoh** (ditandai "Mode pratinjau" di situs). Database, akun, pembayaran Midtrans, dan ongkir Biteship dikerjakan pada phase berikutnya. Lihat [`docs/FEATURE-CHECKLIST.md`](docs/FEATURE-CHECKLIST.md) untuk status setiap fitur.

---

## Daftar isi

1. [Software yang dibutuhkan](#1-software-yang-dibutuhkan)
2. [Instalasi](#2-instalasi)
3. [Menjalankan di komputer sendiri](#3-menjalankan-di-komputer-sendiri)
4. [Variabel lingkungan (.env)](#4-variabel-lingkungan-env)
5. [Testing](#5-testing)
6. [Struktur folder](#6-struktur-folder)
7. [Alur kerja GitHub](#7-alur-kerja-github)
8. [Troubleshooting](#8-troubleshooting)
9. [Bagian yang menyusul](#9-bagian-yang-menyusul)

---

## 1. Software yang dibutuhkan

| Software | Versi | Cara cek | Unduh |
|---|---|---|---|
| Node.js | **22 LTS** (minimal 20.9) | `node -v` | https://nodejs.org |
| npm | ikut terpasang bersama Node.js | `npm -v` | — |
| Git | versi terbaru | `git --version` | https://git-scm.com |

Editor yang disarankan: Visual Studio Code.

## 2. Instalasi

Jalankan perintah ini di **Terminal** (macOS/Linux) atau **PowerShell** (Windows):

```bash
# 1. Unduh kode dari GitHub (cukup sekali)
git clone https://github.com/agnesmuthia/Devina_store.git

# 2. Masuk ke folder proyek — semua perintah berikutnya dijalankan dari folder ini
cd Devina_store

# 3. Pasang semua dependensi
npm install

# 4. Buat file pengaturan lokal dari contoh
cp .env.example .env.local
```

> Di Windows PowerShell, ganti langkah 4 dengan: `Copy-Item .env.example .env.local`

## 3. Menjalankan di komputer sendiri

Dari folder `Devina_store`:

```bash
npm run dev
```

Buka **http://localhost:3000** di browser. Setiap kali file disimpan, halaman diperbarui otomatis. Tekan `Ctrl + C` di terminal untuk berhenti.

Halaman yang sudah bisa dicoba:

| Alamat | Isi |
|---|---|
| `/` | Beranda |
| `/produk` | Semua produk (urutkan berdasarkan harga/nama/terbaru) |
| `/kategori/perawatan-hidung` | Halaman kategori |
| `/cari?q=roller` | Hasil pencarian |
| `/produk/lip-cream-matte` | Detail produk dengan pilihan warna |
| `/keranjang` | Keranjang (disimpan di browser, harga dihitung ulang oleh server) |
| `/kebijakan/privasi`, `/faq`, `/kontak` | Halaman informasi (konten diisi dari admin nanti) |
| `/desain` | Katalog komponen design system (internal, tidak diindeks Google) |

Untuk mencoba versi produksi di komputer sendiri:

```bash
npm run build
npm run start
```

## 4. Variabel lingkungan (.env)

- `.env.example` — contoh berisi **nilai palsu**, aman di-commit.
- `.env.local` — nilai asli milikmu. **Tidak pernah di-commit** (sudah diblokir oleh `.gitignore`).

Pada Phase 2 hanya `NEXT_PUBLIC_SITE_URL` yang dipakai. Variabel lain (Supabase, Midtrans, Biteship) sudah dicantumkan di `.env.example` dan akan dijelaskan saat phase-nya dikerjakan.

Aturan penting:
- Variabel berawalan `NEXT_PUBLIC_` **terlihat oleh semua pengunjung**. Jangan pernah menaruh kunci rahasia di sana.
- `SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY`, dan `BITESHIP_API_KEY` adalah **rahasia**. Simpan hanya di `.env.local` dan di pengaturan Environment Variables hosting (Vercel).
- Jangan menempelkan kunci rahasia di chat, issue, atau commit.

## 5. Testing

Dari folder `Devina_store`:

```bash
npm run check      # lint + pemeriksaan tipe + unit test (cepat, jalankan sebelum commit)
npm run test       # unit test saja (logika harga, katalog, keranjang)
npm run build      # memastikan situs bisa di-build untuk produksi
```

Tes end-to-end (membuka browser sungguhan di ukuran ponsel dan desktop):

```bash
npx playwright install chromium   # cukup sekali
npm run build
npm run test:e2e
```

Yang sudah diuji saat ini:
- Perhitungan harga promo: jadwal mulai/selesai, diskon dibulatkan ke bawah, harga promo tidak valid diabaikan.
- Pencarian, filter kategori (termasuk subkategori), pengurutan harga, dan halaman.
- Keranjang: harga **selalu dihitung ulang di server**. Data keranjang yang dimanipulasi di browser tidak bisa mengubah harga. Produk yang hilang atau stok habis ditandai.
- Halaman yang tidak ada mengembalikan status **404**.
- Tidak ada scroll ke samping di ukuran ponsel.

GitHub Actions menjalankan semua tes ini otomatis setiap kali ada push (lihat `.github/workflows/ci.yml`).

## 6. Struktur folder

```
src/
├── app/                    # Halaman (App Router Next.js)
│   ├── (store)/            # Semua halaman toko (berbagi header & footer)
│   ├── desain/             # Katalog komponen design system
│   ├── globals.css         # Token warna, font, radius
│   └── layout.tsx          # Layout utama, font, metadata SEO dasar
├── components/
│   ├── ui/                 # Komponen dasar: tombol, input, badge, dialog, tabel, dll.
│   └── store/              # Komponen toko: header, kartu produk, keranjang, dll.
└── lib/
    ├── catalog/            # Akses data produk (sementara data contoh → Supabase di Phase 4)
    ├── cart/               # Logika keranjang + server action penghitung ulang harga
    ├── content/            # Daftar halaman kebijakan
    ├── pricing.ts          # Aturan harga & promo (dipakai juga oleh checkout nanti)
    └── store-config.ts     # Pengaturan toko (nama, banner, kontak) → admin di Phase 4
e2e/                        # Tes end-to-end Playwright
docs/                       # Rencana arsitektur & checklist fitur
```

Catatan teknis: proyek ini memakai **Next.js 16 dengan Cache Components**. Bagian halaman yang bergantung pada waktu (harga promo) atau URL (pencarian) dibungkus `<Suspense>` dan dirender saat ada request, sedangkan sisanya disiapkan statis supaya cepat.

## 7. Alur kerja GitHub

```bash
git checkout -b nama-fitur        # buat branch baru untuk setiap perubahan
# ... ubah kode ...
npm run check                     # pastikan lolos
git add .
git commit -m "Jelaskan perubahan"
git push -u origin nama-fitur     # lalu buka Pull Request di GitHub
```

Jangan pernah commit file `.env.local`.

## 8. Troubleshooting

| Masalah | Solusi |
|---|---|
| `npm install` gagal karena versi Node | Pasang Node.js 22 LTS, lalu ulangi `npm install`. |
| Port 3000 sudah dipakai | Jalankan `npm run dev -- --port 3001`, lalu buka http://localhost:3001 |
| Error `Cannot find name 'PageProps'` di editor | Jalankan `npm run typecheck` sekali untuk membuat tipe rute. |
| Tampilan tidak berubah setelah edit | Simpan file, lalu refresh browser. Jika masih sama, hentikan (`Ctrl + C`) dan jalankan `npm run dev` lagi. |
| Keranjang kosong padahal sudah diisi | Keranjang tamu disimpan di browser. Mode penyamaran atau menghapus data situs akan mengosongkannya. |

## 9. Bagian yang menyusul

Bagian berikut ditulis saat phase-nya dikerjakan, supaya instruksinya sesuai dengan kode yang benar-benar ada:

- Setup database & migrasi Supabase (Phase 3)
- Konfigurasi Supabase Auth & Storage (Phase 3–4)
- Setup Biteship (ongkir & pelacakan) dan alamat asal pengiriman (Phase 6)
- Setup Midtrans sandbox, webhook, dan syarat aktivasi merchant (Phase 7)
- Deployment ke Vercel, domain, Google Search Console (Phase 10)
- Checklist produksi, backup & pemulihan (Phase 10)

Rencana arsitektur lengkap ada di [`docs/PHASE-1-AUDIT-AND-PLAN.md`](docs/PHASE-1-AUDIT-AND-PLAN.md).
