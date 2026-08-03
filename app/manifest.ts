import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Z-Girl: The Hero Within Reflection System",
    short_name: "Z-Girl",
    description: "Private, guided reflection for youth, adults, and families.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#061521",
    theme_color: "#49d8c2",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    screenshots: [
      {
        src: "/screenshot-wide.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/screenshot-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  };
}
