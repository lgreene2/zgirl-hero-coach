import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Z-Girl: Hero Coach",
    short_name: "Z-Girl",
    description: "A cozy, kid-friendly hero coach for stress, big feelings, and confidence.",
    start_url: "/",
    display: "standalone",
    background_color: "#050b1c",
    theme_color: "#06b6d4",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
