import type { NextConfig } from "next";

// Belt-and-braces with robots.txt: private/transactional pages are also sent
// with an explicit noindex header, so even a page reached via an external link
// can never be indexed.
const NOINDEX_SOURCES = [
  "/admin/:path*",
  "/api/:path*",
  "/cart",
  "/checkout",
  "/orders/:path*",
  "/order-confirmation/:path*",
  "/profile",
  "/wishlist",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/product/:id/customize",
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  async headers() {
    return NOINDEX_SOURCES.map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
    }));
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
