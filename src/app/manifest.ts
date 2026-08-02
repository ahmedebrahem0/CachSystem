import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    lang: "ar",
    dir: "rtl",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f7f4",
    theme_color: "#126b55",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}

