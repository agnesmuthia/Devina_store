# Devina Store — Phase 1: Repository Audit & Architecture Plan

Status: **Approved by the owner on 2026-10-15** (decisions below). Phase 2 is in progress.
Date: 2026-10-15

## Owner decisions (2026-10-15)
1. Stack approved: Next.js + TypeScript + Tailwind + Supabase + Vercel.
2. Payments: **Midtrans Snap** as the primary method. **Virtual account first**, **QRIS enabled after GoPay activation**. The static-QRIS manual fallback was not requested, so it is **not planned** unless the owner asks for it later.
3. Shipping: **Biteship** (rates, pickup booking, tracking webhooks). Biteship replaces RajaOngkir as the first provider in section 7.
4. Checkout **requires a customer account**.
5. Store name: **Devina Store**. Products: beauty — ice face roller, nose strips, nose shaper (pemancung hidung), nose clip (penjepit hidung), and makeup.

> The customer-facing site and the admin will be in Bahasa Indonesia, and the full README will be written in Bahasa Indonesia from Phase 2 on. This planning document is in English to match the brief.

---

## 1. Repository audit

| Item | Finding |
|---|---|
| Git | Initialized. Branch `claude/hopeful-lovelace-je93jj`, **no commits** locally. |
| Remote | `origin` → `github.com/agnesmuthia/Devina_store`. The remote has **no branches or commits** (`git ls-remote` returns nothing). |
| Files | None (only `.git/`). No `package.json`, framework, config, env files, or components. |
| Uncommitted changes | None. |
| Secrets exposure | None. Nothing to leak yet. `.gitignore` will exclude `.env*` from the first commit. |
| Tooling in this environment | Node 22, npm 10, pnpm, Docker, psql. (No Supabase CLI yet; it can run through `npx`.) |

**Conclusion:** this is a **new project**. Nothing needs preserving or migrating, so the default stack from the brief applies.

**Naming:** the owner confirmed **Devina Store** (matching the repository name). The name stays editable from admin settings.

### 1.1 Reusable components and features

None exist. Everything will be built new. Section 9 explains how the work is split.

### 1.2 Missing features

All features in the brief (sections E to Q) are missing. The feature checklist (section 10) tracks each one.

---

## 2. Proposed stack (lean, single-owner)

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Server Components for SEO and speed. Server Actions and Route Handlers keep pricing, payment, and shipping logic on the server. |
| Styling / UI | **Tailwind CSS** plus a small in-repo component library built on headless **Radix** primitives (copied, shadcn-style, not a heavy dependency) | Accessible dialogs, menus, and selects. The visual identity stays our own. |
| Database | **Supabase Postgres** | Relational, with constraints, transactions, and Row Level Security. |
| Auth | **Supabase Auth** (email + password, password recovery) via `@supabase/ssr` | Secure cookie sessions with server-side checks. |
| File storage | **Supabase Storage** (public bucket for product and banner images, private bucket for review photos pending moderation) | Same platform, so one less vendor. |
| Validation | **zod** | One schema, shared by forms and server actions. |
| Rich text | **Tiptap** editor, with server-side HTML sanitization (allowlist) | A visual editor for descriptions and policy pages, safe against XSS. |
| Payments | **Midtrans** via the official `midtrans-client` Node SDK (server only) | See section 6. |
| Shipping | Provider adapter, **Komerce RajaOngkir** first (alternative: Biteship) | See section 7. |
| Tests | **Vitest** (unit and integration against a local Supabase in Docker) and **Playwright** (end-to-end and mobile viewports) | Covers the 17 critical workflows in the brief. |
| Hosting | **Vercel** (with Vercel Cron for scheduled jobs) | Native Next.js hosting. Note: the Hobby plan is non-commercial only (section 8). |
| CSV | `papaparse` | Product import and export. |

Deliberately **not** added: an ORM layer on top of Supabase, Redis, a separate CMS, message queues, or microservices. Postgres functions handle the critical transactions (checkout, stock, payment updates).

---

## 3. Proposed page structure

Indonesian, SEO-friendly URLs.

### Storefront
| Route | Page |
|---|---|
| `/` | Homepage (all sections editable in admin) |
| `/produk` | Catalog (filters, sort, pagination) |
| `/kategori/[slug]` | Category page (with subcategories) |
| `/cari?q=` | Search results |
| `/produk/[slug]` | Product detail (gallery, variants, stock, reviews, structured data) |
| `/keranjang` | Cart |
| `/checkout` | Checkout (address → shipping → review) |
| `/pesanan/[orderNumber]/bayar` | Payment instructions and live status |
| `/masuk`, `/daftar`, `/lupa-password`, `/atur-ulang-password` | Auth |
| `/akun` | Profile |
| `/akun/alamat` | Address book |
| `/akun/pesanan`, `/akun/pesanan/[orderNumber]` | Order history, detail, and tracking timeline |
| `/akun/wishlist` | Wishlist |
| `/akun/ulasan` | Reviews written and items eligible for review |
| `/faq`, `/kontak` | FAQ and contact |
| `/kebijakan/pengiriman`, `/kebijakan/pembatalan`, `/kebijakan/pengembalian`, `/kebijakan/privasi`, `/kebijakan/syarat-ketentuan` | Policy pages (content edited in admin) |
| `/sitemap.xml`, `/robots.txt` | SEO |

### Admin (`/admin`, `noindex`, admin-only, server-verified)
| Route | Section |
|---|---|
| `/admin` | Overview (sales today and this month, paid orders, awaiting payment, to fulfill, low or out of stock, best sellers, trend, activity) |
| `/admin/produk`, `/admin/produk/baru`, `/admin/produk/[id]` | Product list and editor (images, variants, prices, promo schedule, SEO, duplicate, archive) |
| `/admin/kategori` | Categories and subcategories |
| `/admin/inventaris` | Fast stock and price grid, CSV import and export |
| `/admin/pesanan`, `/admin/pesanan/[id]` | Orders (filters, valid status transitions, shipping, waybill, activity log) |
| `/admin/pelanggan`, `/admin/pelanggan/[id]` | Customers and their orders |
| `/admin/ulasan` | Review moderation and replies |
| `/admin/pemasaran/beranda`, `/banner`, `/kupon`, `/promosi` | Homepage content, banners, coupons, scheduled promotions, featured products |
| `/admin/halaman` | Policy, FAQ, and contact page content |
| `/admin/pengaturan/*` | Branding, contact, origin address, shipping provider, payment provider and integration status, notifications, SEO defaults |
| `/admin/aktivitas` | Admin activity log |

### Server endpoints (not pages)
- `POST /api/payments/midtrans/notification`: Midtrans HTTP notification (webhook).
- `GET /api/shipping/destinations?q=`: destination search, proxied to the provider.
- `POST /api/shipping/rates`: rate quote (the server computes the weight).
- `GET /api/cron/expire-orders`, `/api/cron/reconcile-payments`, `/api/cron/sync-tracking`: scheduled jobs protected by a secret.

---

## 4. Proposed database schema

Money is stored as **integer Rupiah (`bigint`)**, never floats. Timestamps are `timestamptz`. All tables have RLS enabled. Customers can read and write only their own rows. Admin access goes through an `is_admin()` SQL function. Writes involving money or stock go only through server code or `SECURITY DEFINER` functions.

### Identity and access
- **profiles** (`id` → `auth.users`, `full_name`, `phone`, timestamps). There is **no role column a user can edit.**
- **admin_users** (`user_id` PK → `auth.users`, `created_at`). Rows can be inserted only with the service role or SQL, never from the browser. An extra env allowlist (`ADMIN_EMAILS`) is checked server-side as a second gate.
- **addresses** (`user_id`, `label`, `recipient_name`, `phone`, `province`, `city`, `district`, `subdistrict`, `postal_code`, `street`, `notes`, `destination_ref` = the shipping provider's location ID, `is_default`). A partial unique index allows only one default per user.

### Catalog
- **categories** (`parent_id` self-FK, `name`, `slug` unique, `description`, `image_path`, `sort_order`, `is_active`, `seo_title`, `seo_description`).
- **products** (`category_id`, `name`, `slug` unique, `short_description`, `description_html` (sanitized), `status` ∈ draft/active/archived, `is_featured`, `weight_grams`, `length_mm`/`width_mm`/`height_mm`, `seo_title`, `seo_description`, `published_at`, timestamps).
  *"Out of stock" is derived from variant stock = 0, not stored, so it can never drift out of sync with inventory. It still appears as a status badge and filter.*
- **product_slug_history** (`old_slug` unique → `product_id`). Used for 301 redirects when a slug changes.
- **product_images** (`product_id`, `variant_id` nullable, `storage_path`, `alt_text`, `sort_order`).
- **product_options** (e.g. "Ukuran") and **product_option_values** (e.g. "M").
- **product_variants** (`product_id`, `sku` **unique**, `option_value_ids`, `price`, `sale_price`, `sale_starts_at`, `sale_ends_at`, `stock_quantity` **CHECK ≥ 0**, `weight_grams` override, `is_active`, `is_default`). A product without options gets one default variant, so SKU, price, and stock always live in one place.
- **stock_movements** (`variant_id`, `order_id` nullable, `delta`, `reason` ∈ order_reserved/order_released/admin_adjustment/import/return, `admin_id`, `created_at`). A unique index on (`order_id`, `variant_id`, `reason`) makes it **impossible to deduct or restore stock twice for one order**.

### Shopping
- **carts** (`user_id` unique) and **cart_items** (`cart_id`, `variant_id`, `quantity` CHECK > 0, unique (`cart_id`, `variant_id`)). Guests keep a local cart that merges into the account cart at login.
- **wishlist_items** (`user_id`, `product_id`, PK on both).
- **coupons** (`code` unique, case-insensitive, `discount_type` percent/fixed, `value`, `min_subtotal`, `max_discount`, `starts_at`, `ends_at`, `usage_limit`, `per_customer_limit`, `is_active`) and **coupon_redemptions** (`coupon_id`, `order_id` unique, `user_id`).
- **promotions** (named scheduled campaigns that apply sale prices to selected products or variants in bulk, with start and end dates). Variant `sale_*` fields handle simple per-product promos.

### Orders
- **orders** (`order_number` unique, e.g. `DVS-251015-7K3Q`, `user_id`, `payment_status`, `fulfillment_status`, `subtotal`, `product_discount`, `coupon_discount`, `shipping_cost`, `other_charges`, `grand_total`, `currency`='IDR', `coupon_code`, `shipping_address` **JSON snapshot**, `courier_code`, `courier_service`, `shipping_etd`, `shipping_rate_source` ∈ api/manual, `total_weight_grams`, `customer_note`, `payment_expires_at`, `paid_at`, `cancelled_at`, timestamps). Indexes cover the admin filters.
- **order_items** (`order_id`, `product_id`/`variant_id` nullable with ON DELETE SET NULL, plus **snapshots**: `product_name`, `variant_label`, `sku`, `image_path`, `unit_price`, `unit_original_price`, `weight_grams`, `quantity`, `line_total`).
- **order_events** (`order_id`, `event_type`, `from_status`, `to_status`, `actor_type` ∈ system/admin/customer/payment_provider/shipping_provider, `actor_id`, `note`, `metadata`, `created_at`). This is the activity history and the source of the customer timeline.

### Payments
- **payments** (one row per payment *attempt*: `order_id`, `provider`, `method`, `provider_order_id` **unique** (the Midtrans `order_id`, e.g. `DVS-251015-7K3Q-1`), `provider_transaction_id`, `status`, `gross_amount`, `snap_token`/`redirect_url` or `qr_string`/`va_numbers`, `expires_at`, `paid_at`, `last_provider_response` JSON, timestamps).
- **payment_notifications** (`provider_order_id`, `transaction_status`, `signature_valid`, `payload`, `dedupe_key` **unique**, `processed_at`, `processing_error`, `received_at`). Raw audit trail plus idempotency.

### Shipping
- **shipments** (`order_id`, `provider`, `courier_code`, `service`, `waybill_number`, `status`, `tracking_url`, `shipped_at`, `delivered_at`, `last_synced_at`).
- **shipment_events** (`shipment_id`, `occurred_at`, `status`, `description`, `location`, `source` ∈ provider/admin, `raw`, unique on (`shipment_id`, `occurred_at`, `description`)). Only real provider data or explicit admin actions go here.

### Trust and content
- **reviews** (`product_id`, `user_id`, `order_item_id` **unique**, so one review per purchased item, `rating` CHECK 1–5, `body`, `status` ∈ pending/approved/rejected, `is_verified_purchase` (set by the server only), `admin_reply`, `admin_replied_at`, timestamps) and **review_images**.
- **banners** (`title`, `subtitle`, `image_path`, `link_url`, `cta_label`, `placement`, `sort_order`, `starts_at`, `ends_at`, `is_active`).
- **content_pages** (`slug`, `title`, `body_html`, `seo_title`, `seo_description`) for policies, FAQ, and contact.
- **store_settings** (one row per section: branding, contact, origin, homepage, shipping, payment, notifications, seo, as validated JSON). **Secrets are never stored here.** They stay in server environment variables.
- **admin_activity_logs** (`admin_id`, `action`, `entity_type`, `entity_id`, `changes` JSON, `created_at`).

### State machines (enforced in one TypeScript module and in the DB functions)
- **Payment:** `pending → paid | failed | expired | cancelled`. Then `paid → refund_pending → refunded`. A `failed` or `expired` attempt can be replaced by a new attempt while the order is still open.
- **Fulfillment:** `unfulfilled → processing ("Sedang dikemas") → shipped → in_transit → delivered`. `cancelled` is allowed only before `shipped`. `returned` is allowed only after `delivered`.
- **Customer timeline:** Order created → Payment confirmed → Being prepared → Shipped → In transit → Delivered. It is built only from `order_events` and real `shipment_events`.

### Stock policy (prevents overselling)
1. At order creation, one Postgres transaction runs `UPDATE product_variants SET stock_quantity = stock_quantity - :qty WHERE id = :id AND stock_quantity >= :qty` for every line. If any line affects 0 rows, the whole order is rolled back with a clear "stock unavailable" message. This is a stock **reservation**.
2. Payment expiry, cancellation, or failure without a retry **releases** the reservation exactly once (guarded by the `stock_movements` unique index).
3. Edge case: a settlement arrives for an order whose reservation was already released. The order is flagged **"Paid, needs review"** for the admin. It is never silently fulfilled, and nothing is oversold.

---

## 5. Static QR vs. transaction-specific QRIS vs. gateway transaction

Source note: this container's network policy blocks `docs.midtrans.com`, so the facts below come from **search excerpts of Midtrans' official pages** (linked at the end). Phase 7 will re-verify them against the live docs and your dashboard before any code depends on them.

| | **1. Static / fixed merchant QR** (e.g. *GoPay Static QRIS*) | **2. Dynamic / transaction-specific QRIS** | **3. Gateway transaction with server notifications** |
|---|---|---|---|
| What it is | One QR printed or downloaded from the dashboard, the same for every customer. | A new QR generated per order by an API call. | Any payment the server creates through the API with our own `order_id` (QRIS, virtual account, e-wallet, etc.). |
| Amount | **Customer types the amount** after scanning. | **Fixed by the merchant** in the QR and cannot be changed. | Fixed by the server. |
| Order ID | **Assigned by Midtrans as `QRIS-xxx`.** It is *not* our order number. | Chosen by us. | Chosen by us. |
| Linking payment to order | **No reliable automatic link.** Midtrans says settlement notifications and reports exist for static QRIS, but the notification carries Midtrans' `QRIS-xxx` ID, not our order. Matching by amount and time is guesswork: two Rp150.000 payments a minute apart look the same, and a customer can mistype the amount. | Automatic. The notification carries our `order_id`. | Automatic. |
| Status updates | Visible in the Midtrans dashboard (SETTLEMENT). | Webhook + Get Status API. | Webhook + Get Status API. |
| Expiry | None, since the QR is permanent. | Per transaction (e.g. 15 minutes by default for Snap "Other QRIS", configurable). | Per transaction. |
| Safe for automatic "paid" | **No.** | **Yes**, after signature check and status verification. | **Yes**, after signature check and status verification. |

**What this means for you right now:**
- Your dashboard shows *GoPay Static QRIS* as disabled until **GoPay e-money** is activated. Midtrans' docs also state that **dynamic QRIS through Snap ("Other QRIS") requires GoPay or ShopeePay QRIS to be active** on the account, and that merchants who already accept GoPay can accept QRIS. So activating GoPay is probably the step that unlocks **both** QRIS paths. This is not confirmed for your account. Phase 7 includes checking the *Payment Methods* page after activation.
- Activation timing: Midtrans pages disagree (1 working day vs. 3–7 working days, and your dashboard says 3). Treat all of these as provisional.
- Fees from Midtrans' public pricing and docs (provisional, may change, check before launch): **QRIS 0.7%** per successful transaction for regular merchants, **GoPay 2%**, **virtual account Rp4.000 flat (excluding VAT)**. No setup or monthly fee.

---

## 6. Recommended payment architecture

### Recommendation
1. **Primary: Midtrans Snap (dynamic, server-created transactions).**
   - The server validates the cart, recomputes the total, reserves stock, creates the order, and creates a Snap transaction with **our** `order_id` and exact `gross_amount`.
   - The customer pays in the Snap popup or redirect. The enabled methods are an admin setting. **Virtual accounts (bank transfer) do not depend on GoPay**, so the store can take payments once the account is approved for production. **QRIS (`other_qris`/`gopay`) turns on when GoPay activation is done.** Snap shows a transaction-specific QR then, so no code change is needed.
   - Confirmation happens only through the **HTTP notification webhook**: (a) verify `signature_key = SHA512(order_id + status_code + gross_amount + ServerKey)`, (b) **re-fetch the status from the Midtrans Get Status API** before trusting it, (c) check that the amount equals our stored `gross_amount`, (d) apply the state transition in one DB transaction keyed by a unique dedupe key. Duplicate or replayed notifications become no-ops.
   - Browser redirects (`finish`/`unfinish`) only **display** the status. They never change it.
   - A **reconciliation cron** asks Get Status for pending attempts in case a webhook was lost. An **expiry cron** expires unpaid orders and releases stock.
   - Status mapping: `settlement` → paid; `capture` + `fraud_status=accept` → paid; `pending` → pending; `deny`/`failure` → failed; `expire` → expired; `cancel` → cancelled; `refund`/`partial_refund` → refunded. Anything unexpected is flagged for review.
2. **Optional later: inline QRIS via Core API** (`/v2/charge`, `payment_type: "qris"`, which returns `qr_string` and a `generate-qr-code` action). This shows the QR on our own payment page instead of Snap's. It uses the same webhook handler. I'd build it only if you want that look, since Snap already covers it.
3. **Fallback: static QRIS with manual verification. Disabled by default, clearly labeled, admin opt-in.**
   - The order is created as `pending` with a clearly stated expiry. The page shows your static QR and the **exact amount to enter**.
   - The customer may upload proof (optional), which **does not** change the status.
   - **You** check the Midtrans dashboard, then click "Konfirmasi pembayaran manual" in admin. This requires typing the Midtrans reference (`QRIS-xxx`), writes an `order_events` + `admin_activity_logs` entry, and only then marks the order paid.
   - The UI tells customers verification is manual and may take time. **Recommendation:** use this only if Snap/dynamic QRIS stays unavailable for a long time, because it costs you manual work on every order and is more prone to disputes.

### Payment integration status (admin, set manually, not detected from Midtrans)
`Belum dikonfigurasi` → `Sandbox terkonfigurasi` → `Menunggu aktivasi merchant` → `Siap verifikasi produksi` → `Produksi terverifikasi`.
The app *does* detect automatically whether keys are present and whether the environment is sandbox or production. The rest is your declaration, because Midtrans offers no official API for merchant activation status. **Production checkout stays blocked** until the status is `Produksi terverifikasi` **and** `MIDTRANS_IS_PRODUCTION=true` **and** production keys are set.

### Demo mode (no keys)
Checkout runs end to end and shows a clearly marked **"MODE DEMO — tidak ada pembayaran nyata"** payment screen. Demo orders can never become `paid`. In non-production environments, a developer-only button can simulate a notification **through the same verification code path**.

---

## 7. Recommended shipping strategy

A `ShippingProvider` interface: `searchDestinations()`, `getRates(origin, destination, weightGrams, couriers)`, and optionally `trackWaybill()` and `createShipment()`. Both candidates below fit behind it.

| | **Komerce RajaOngkir (API V2)** | **Biteship** |
|---|---|---|
| Rates | `POST /calculate/domestic-cost` (base `https://rajaongkir.komerce.id/api/v1`) with origin, destination, weight, courier. | Rates API across 30+ couriers (JNE, J&T, SiCepat, AnterAja, etc.). |
| Tracking | Waybill (AWB) tracking endpoint. Some couriers (e.g. JNE) need the last digits of the recipient's phone number. | Tracking API plus **webhooks** for status updates. |
| Shipment booking / pickup | Not core to this API. | Yes (create order / pickup). |
| Pricing | *Starter* tier on signup (free, with daily request limits) and a paid *Pro* subscription. **I could not confirm the current quotas or prices.** Check the Komerce dashboard. | Marketed "from Rp5 per API request". Verify on their pricing page. |
| Best fit | You drop parcels at courier counters yourself and type the waybill into admin. | You want booking and pickup from the dashboard and automatic tracking updates. |

**Decision (owner, 2026-10-15): Biteship** for rates, pickup booking, and tracking webhooks. RajaOngkir stays a possible alternative behind the same interface. Other details:
- Weight is computed **on the server** from variant weights × quantities (with a configurable packaging allowance, rounded up per the provider's rules).
- If the provider fails, the customer sees "Ongkir tidak dapat dihitung, coba lagi". No quote is ever made up.
- Manual flat rates exist only if enabled in admin and are labeled "Tarif manual" on checkout and the order.
- The server re-quotes or validates the selected rate before creating the order. The browser-supplied price is ignored.
- Tracking events are stored only from real provider responses, and the official courier tracking link is shown when available.

---

## 8. External accounts and credentials to prepare

| # | Account | What you need | When |
|---|---|---|---|
| 1 | **Supabase** | A project (region: Singapore). `Project URL`, publishable/anon key, **service role key (secret)**. | Phase 3 |
| 2 | **Midtrans Sandbox** | Sandbox *Merchant ID*, *Client Key*, **Server Key (secret)**. Available now from the dashboard's environment switch. | Phase 7 |
| 3 | **Midtrans Production** | GoPay e-money activation → check QRIS availability. Production keys. Set the *Payment Notification URL* to `https://<domain>/api/payments/midtrans/notification` and the Finish/Unfinish/Error redirect URLs. | Before launch |
| 4 | **Shipping (Biteship)** | Biteship account + API key (test and live). Your **origin address** (province, city, district, postal code) and pickup contact. | Phase 6 |
| 5 | **Vercel** | Account linked to GitHub. **Pro plan for commercial use.** | Phase 10 (preview deploys can start earlier) |
| 6 | **Domain** | Registrar account plus DNS access. | Phase 10 |
| 7 | **Email (SMTP)** | A transactional email provider (e.g. Resend or Brevo) with a verified sending domain, for password resets and order emails. Supabase's built-in email is rate-limited and meant for testing only. | Phase 3 (test) / Phase 10 (production) |
| 8 | **Google Search Console** | Verify the domain after launch. | Phase 10 |
| 9 | **Business content** | Logo (or I'll use a text logo), **product category**, store description, WhatsApp and email contact, policies (shipping, cancellation, returns, privacy, terms), first products with photos. | Anytime. Placeholders until then. |

**Never paste secrets into chat or commit them.** They go into Vercel/Supabase environment settings and your local `.env.local` (git-ignored). The repo will contain only `.env.example` with placeholders.

---

## 9. Expected cost categories

Figures come from the providers' public pages or third-party summaries as of today. **All are provisional, so check the official pricing pages before committing.**

| Category | Type | Indicative cost | Notes |
|---|---|---|---|
| Domain | Recurring, yearly | Depends on registrar and TLD (`.com`, `.id`, `.co.id`) | `.co.id` requires business documents. |
| Hosting (Vercel) | Monthly subscription + usage | Hobby $0 is **non-commercial only**. **Pro ≈ $20/user/month** (includes usage credit). | A store is commercial use, so plan for Pro at launch. |
| Database + Auth + Storage (Supabase) | Monthly subscription + usage | Free $0: 500 MB DB, 1 GB storage, **pauses after 7 days of inactivity, no backups**. **Pro ≈ $25/month** (more DB and storage, daily backups). | Free works for development. Pro is recommended for production. |
| Image storage | Included in Supabase, overage per GB | — | Images are compressed before upload. Thumbnails resize via Next.js image optimization (check Vercel image optimization limits). |
| Payment fees (Midtrans) | **Per transaction** | QRIS 0.7%, GoPay 2%, VA Rp4.000 (+VAT) | No setup or monthly fee. Bank Indonesia has lower QRIS MDR tiers for micro merchants (UMI). Ask Midtrans whether you qualify. |
| Shipping API | Free tier or subscription / per request | RajaOngkir Starter (limited) / Pro subscription. Biteship from Rp5/request. | The shipping cost itself is paid by the customer. |
| Email | Free tier / monthly | Most providers have a free tier enough for a small store. | Needed for password resets. |
| Backups & monitoring | Included / optional | Supabase Pro daily backups. Optional free error tracking (e.g. Sentry free tier). | A documented manual export procedure goes in the README. |

**Rough launch budget:** about **$45/month** (Vercel Pro + Supabase Pro) + the domain + per-transaction fees. Development can run at **$0** on free tiers.

---

## 10. Implementation milestones

Each phase ends with: files changed, what works, tests run, open issues, external configuration still needed, and the next step. **I will stop for your review after each phase.**

| Phase | Deliverable | Done when |
|---|---|---|
| **1** | This audit and plan | You approve or adjust it. |
| **2** | Next.js + TS + Tailwind scaffold, design system (tokens, buttons, inputs, badges, cards, dialogs, tables, toasts, states), responsive storefront shell (header with search and cart, footer, homepage layout, catalog, product page), Indonesian README skeleton, `.env.example`, lint and test tooling, CI on GitHub Actions | Pages render on mobile and desktop with placeholder data; lint, typecheck, and unit tests pass |
| **3** | Supabase schema migrations + RLS, auth (register, login, password reset), profile, address book, admin allowlist | Auth and RLS privacy tests pass against a local Supabase |
| **4** | Real catalog from the DB, admin product editor (images, variants, promos, SEO, duplicate, archive, CSV), categories, inventory grid, settings and homepage editor | Owner can create and publish a product with no code; tests pass |
| **5** | Cart (guest + account merge), wishlist, coupons, checkout, server-side pricing, transactional stock reservation | Price-tampering and concurrent-order tests pass |
| **6** | Shipping provider adapter (Biteship), destination search, live rates, manual fallback, order creation with shipping | Mocked success and failure tests pass; live test with your sandbox/Starter key |
| **7** | Payment abstraction, Midtrans Snap sandbox, webhook verification, idempotency, expiry and reconciliation crons, demo mode, integration status | Sandbox payment completes end to end; duplicate and forged webhook tests pass |
| **8** | Admin order management, state transitions, Biteship shipment booking and waybill, tracking webhooks, customer timeline, email notifications | Tracking update tests pass |
| **9** | Reviews (verified purchase, moderation, replies, photos), SEO (metadata, sitemap, robots, JSON-LD, slug redirects, breadcrumbs), policy pages | Structured data validates; review rule tests pass |
| **10** | Security review, rate limiting, full test pass (17 workflows incl. mobile E2E), production checklist, deployment, domain, Search Console, backup docs | Feature checklist completed honestly |

### Feature checklist (kept updated in `docs/FEATURE-CHECKLIST.md` from Phase 2)
Legend: ✅ implemented & tested · 🔑 implemented, awaiting external credentials · 🧪 demo only · ⬜ not yet implemented.
Current state: **everything ⬜**.

---

## 11. Decisions needed from you before Phase 2 (answered — see "Owner decisions" at the top)

1. **Stack:** approve Next.js + TypeScript + Tailwind + Supabase + Vercel?
2. **Payments:** approve **Snap (dynamic) as primary**, with **VA enabled first** and **QRIS turned on after GoPay activation**? Should the **static-QRIS manual-verification** fallback be built (disabled by default), or skipped?
3. **Shipping:** **Komerce RajaOngkir** (rates + waybill tracking, you drop parcels at counters) or **Biteship** (booking/pickup + tracking webhooks)?
4. **Checkout:** require an account to check out (recommended: simpler privacy, order history, reviews), or allow guest checkout?
5. **Store details:** product category and spelling ("Daviena" vs. "Devina")? Placeholders are fine to start.

---

### Sources (official pages, read via search excerpts; to be re-verified in Phase 7)
- Midtrans — [GoPay Static QRIS](https://docs.midtrans.com/docs/gopay-static-qris), [Introduction to Static QRIS](https://docs.midtrans.com/docs/introduction-to-static-qris), [QRIS (Core API)](https://docs.midtrans.com/reference/qris), [Other QRIS (Snap)](https://docs.midtrans.com/reference/other-qris), [QRIS Payment Method in Midtrans](https://docs.midtrans.com/docs/qris-payment-method-in-midtrans), [HTTP(S) Notification / Webhooks](https://docs.midtrans.com/docs/https-notification-webhooks), [Handling HTTP Notification](https://docs.midtrans.com/reference/handle-notifications), [QRIS fee](https://docs.midtrans.com/docs/berapa-biaya-transaksi-untuk-qris), [Pricing](https://midtrans.com/pricing)
- Shipping — [RajaOngkir API V2 (Komerce)](https://rajaongkir.com/docs/shipping-cost/getting_started/about), [Calculate Domestic Cost](https://dev-collaborator.komerce.id/docs/Shipping-cost/calculate_domestic/), [Biteship API](https://biteship.com/en/product/api)
- Hosting — [Vercel Hobby plan](https://vercel.com/docs/plans/hobby), [Supabase pricing summary (third-party)](https://makerkit.dev/blog/saas/supabase-pricing)
