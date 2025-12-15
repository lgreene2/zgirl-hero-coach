import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
   id: "/zgirl-hero-coach-v2",
    
    name: "Z-Girl: Hero Coach",
    short_name: "Z-Girl",
    description:
      "A gentle hero coach for youth reflection and encouragement.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#0ea5e9",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
