import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Partial Prefetching serves a 200 fallback shell on the first visit to an unknown
  // product/category URL and only returns 404 afterwards. A store needs consistent 404s
  // for SEO, so it stays off until Next.js handles unknown params differently.
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Product photos will come from Supabase Storage (Phase 4); add its host here then.
    remotePatterns: [],
  },
  poweredByHeader: false,
};

export default nextConfig;
