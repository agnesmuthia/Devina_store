import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalScroll(page: Page) {
  // Compare with the configured viewport: on mobile emulation window.innerWidth grows with overflowing content.
  const viewportWidth = page.viewportSize()!.width;
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, "page must not scroll sideways").toBeLessThanOrEqual(viewportWidth);
}

test("homepage shows hero, categories, and product sections", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Devina Store/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Kategori unggulan" }).getByRole("link")).toHaveCount(3);
  await expect(page.getByRole("region", { name: "Sedang promo" })).toBeVisible();
  // Best sellers need real paid orders; with none, the section must not appear.
  await expect(page.getByRole("region", { name: "Terlaris" })).toHaveCount(0);
  await expect(page.getByText("Mode pratinjau")).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test("search finds products and handles no results", async ({ page }) => {
  await page.goto("/cari?q=hidung");
  await expect(page.getByText(/hasil untuk “hidung”/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Nose Strip Pembersih Komedo" })).toBeVisible();

  await page.goto("/cari?q=sepatu");
  await expect(page.getByRole("heading", { name: "Produk tidak ditemukan" })).toBeVisible();
});

test("search form submits from the header", async ({ page, isMobile }) => {
  await page.goto("/");
  const box = page.locator(isMobile ? "#search-mobile" : "#search-desktop");
  await box.fill("lip cream");
  await box.press("Enter");
  await expect(page).toHaveURL(/\/cari\?q=lip\+cream/);
  await expect(page.getByRole("link", { name: "Lip Cream Matte" })).toBeVisible();
});

test("category page includes subcategory products", async ({ page }) => {
  await page.goto("/kategori/makeup");
  await expect(page.getByRole("heading", { level: 1, name: "Makeup" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Lip Cream Matte" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Cushion Foundation" })).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test("catalog sorting by price updates the URL", async ({ page }) => {
  await page.goto("/produk");
  // Role queries skip hidden streamed markup that React has not swapped in yet.
  await page.getByRole("combobox", { name: "Urutkan" }).selectOption("harga-terendah");
  await expect(page).toHaveURL(/urut=harga-terendah/);
  await expect(page.locator("article h3").first()).toHaveText("Penjepit Hidung Silikon");
});

test("product page: variant selection, sold-out variant, add to cart", async ({ page }) => {
  await page.goto("/produk/lip-cream-matte");
  await expect(page.getByRole("heading", { level: 1, name: "Lip Cream Matte" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Belum ada ulasan" })).toBeVisible();

  await page.getByRole("button", { name: /Nude Peach/ }).click();
  await expect(page.getByRole("button", { name: "Stok habis", exact: true })).toBeDisabled();

  await page.getByRole("button", { name: "Berry", exact: true }).click();
  await page.getByRole("button", { name: "Tambah jumlah" }).click();
  await page.getByRole("button", { name: "Tambah ke keranjang" }).click();
  await expect(page.getByText("Ditambahkan ke keranjang")).toBeVisible();
  await expect(page.getByRole("link", { name: "Keranjang, 2 barang" })).toBeVisible();
});

test("cart re-prices on the server, ignores tampered data, and updates quantities", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "devina-cart-v1",
      JSON.stringify([
        { variantId: "var-ice-roller-pink", quantity: 2, price: 1 },
        { variantId: "var-does-not-exist", quantity: 1 },
        { variantId: "var-penjepit", quantity: 1 },
      ]),
    ),
  );
  await page.goto("/keranjang");

  const summary = page.getByRole("complementary", { name: "Ringkasan belanja" });
  // 2 × Rp 39.000 (sale price from the server, not the tampered "price: 1"); the sold-out item is excluded.
  await expect(summary.getByText("Rp 78.000")).toBeVisible();
  await expect(page.getByText("Stok habis. Hapus barang ini untuk melanjutkan.")).toBeVisible();
  await expect(page.getByText(/sudah tidak tersedia dan telah dihapus/)).toBeVisible();

  await page.getByRole("button", { name: "Tambah jumlah" }).click();
  await expect(summary.getByText("Rp 117.000")).toBeVisible();

  await page.getByRole("button", { name: "Hapus" }).nth(1).click();
  await expect(summary.getByRole("button", { name: "Checkout" })).toBeDisabled();
});

for (const path of ["/produk/tidak-ada", "/kategori/tidak-ada", "/kebijakan/tidak-ada"]) {
  test(`unknown page ${path} returns HTTP 404`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeVisible();
  });
}

for (const path of ["/produk", "/produk/lip-cream-matte", "/keranjang", "/cari?q=hidung", "/kebijakan/privasi", "/desain"]) {
  test(`no horizontal scroll on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expectNoHorizontalScroll(page);
  });
}

test("robots.txt blocks private areas", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  for (const path of ["/admin", "/akun", "/keranjang", "/checkout"]) expect(body).toContain(`Disallow: ${path}`);
});
