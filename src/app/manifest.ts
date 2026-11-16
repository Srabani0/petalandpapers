import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ee",
    theme_color: SITE.themeColor,
    lang: "en-IN",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: SITE.logoPath, sizes: "any", type: "image/png", purpose: "any" },
    ],
  };
}
