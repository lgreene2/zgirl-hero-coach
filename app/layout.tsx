import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Nunito } from "next/font/google";

import VersionBadge from "@/components/VersionBadge";
import AppFooter from "@/components/AppFooter";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zgirl-hero-coach.vercel.app"),
  title: "Z-Girl: Hero Coach",
  description: "A gentle hero coach for youth reflection and encouragement.",
  applicationName: "Z-Girl: Hero Coach",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Z-Girl",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
    { media: "(prefers-color-scheme: light)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${nunito.className} bg-slate-950 text-slate-50 antialiased min-h-screen flex flex-col`}
      >
        <div className="flex-1">{children}</div>

        {/* Footer renders everywhere except "/" */}
        <AppFooter />

        {/* Version badge */}
        <div className="fixed bottom-3 left-3 z-50">
          <VersionBadge />
        </div>

        <Analytics />
      </body>
    </html>
  );
}
