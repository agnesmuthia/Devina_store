import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/store-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/akun", "/keranjang", "/checkout", "/pesanan", "/masuk", "/cari", "/api/", "/desain"],
    },
    host: getSiteUrl(),
  };
}
