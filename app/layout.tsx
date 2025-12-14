// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"; // ⬅️ new

// Brand font (feels friendly + heroic)
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zgirl-hero-coach.vercel.app"),

  title: {
    default: "Z-Girl: Hero Coach – Unwrap the Hero Within",
    template: "%s | Z-Girl: Hero Coach",
  },

  description:
    'Holiday Hero Coach chat with Z-Girl from The 4Lessons universe. A gentle, encouraging space to talk about stress, family drama, and big feelings while you "Unwrap the Hero Within."',

  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020617" }, // slate-950
    { media: "(prefers-color-scheme: light)", color: "#0f172a" }, // slate-900
  ],

  manifest: "/manifest.json",

icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
  ],
  apple: [{ url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }],
},

  openGraph: {
    type: "website",
    url: "https://zgirl-hero-coach.vercel.app", // ⬅️ full URL instead of "/"
    siteName: "Z-Girl: Hero Coach",
    title: "Z-Girl: Hero Coach – Holiday Live Coach Mode",
    description:
      'Feeling stressed, tired, or stuck? Z-Girl helps you practice healthy coping skills and “Unwrap the Hero Within” with gentle, music-powered coaching.',
    images: [
      {
        url: "/og/zgirl-hero-coach.png",
        width: 1200,
        height: 630,
        alt: "Z-Girl: Hero Coach – Unwrap the Hero Within",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Z-Girl: Hero Coach – Unwrap the Hero Within",
    description:
      "Chat with Z-Girl from The 4Lessons universe about holiday stress, family drama, and big feelings in a safe, encouraging space.",
    images: ["/og/zgirl-hero-coach.png"],
  },

  appleWebApp: {
    capable: true,
    title: "Z-Girl: Hero Coach",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${nunito.className} bg-slate-950 text-slate-50 antialiased min-h-screen`}
      >
        {children}
        <Analytics /> {/* ⬅️ Vercel Analytics hook */}
      </body>
    </html>
  );
}
