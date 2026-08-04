import "./globals.css";

import type { Metadata, Viewport } from "next";
import ConditionalPilotCTA from "@/components/ConditionalPilotCTA";
import { Analytics } from "@vercel/analytics/react";

import VersionBadge from "@/components/VersionBadge";
import AppFooter from "@/components/AppFooter";
import PWAClient from "@/components/PWAClient";

export const metadata: Metadata = {
  metadataBase: new URL("https://zgirlinitiative.org"),
  title: {
    default: "Z-Girl: The Hero Within Reflection System",
    template: "%s | Z-Girl",
  },
  description:
    "A character-powered, safety-first reflection system that helps youth and adults turn difficult moments into achievable Hero Moves.",
  applicationName: "Z-Girl: Hero Within",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Z-Girl: Hero Within",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#061521" },
    { media: "(prefers-color-scheme: light)", color: "#061521" },
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
        className="bg-[#061521] text-slate-50 antialiased min-h-screen flex flex-col"
      >
        <div className="flex-1">{children}</div>

        {/* Footer renders everywhere except "/" */}
        <AppFooter />

        {/* Version badge */}
        <div className="fixed bottom-3 left-3 z-50">
          <VersionBadge />
        </div>
        {/* Conditional conversion CTA (one-pager & safety only) */}
        <ConditionalPilotCTA />

        <PWAClient />

        <Analytics />
      </body>
    </html>
  );
}
