import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Z-Girl: The Hero Within Reflection System",
    short_name: "Z-Girl",
    description: "Private, guided reflection for youth, adults, and families.",
    start_url: "/",
    scope: "/",
    lang: "en-US",
    display: "standalone",
    orientation: "any",
    background_color: "#061521",
    theme_color: "#49d8c2",
    categories: ["education", "lifestyle", "health"],
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
    shortcuts: [
      {
        name: "Private Reflection",
        short_name: "Reflect",
        description: "Start a private Hero Within reflection.",
        url: "/reflect",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "7-Day Journey",
        short_name: "Journey",
        description: "Continue the 7-Day Hero Within Journey.",
        url: "/journey",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
