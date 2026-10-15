import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/store/cart-provider";
import { getSiteUrl } from "@/lib/store-config";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap", axes: ["opsz"] });

const STORE_NAME = "Devina Store";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: `${STORE_NAME} — Perawatan Wajah, Hidung & Makeup`, template: `%s | ${STORE_NAME}` },
  description:
    "Belanja ice roller wajah, nose strip, alat pemancung dan penjepit hidung, serta makeup di Devina Store. Ongkir otomatis ke seluruh Indonesia.",
  applicationName: STORE_NAME,
  openGraph: { type: "website", locale: "id_ID", siteName: STORE_NAME },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#fffdfc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <CartProvider>{children}</CartProvider>
        <Toaster position="top-center" richColors closeButton toastOptions={{ className: "font-sans" }} />
      </body>
    </html>
  );
}
