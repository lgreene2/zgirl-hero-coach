import "./globals.css";

import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { Nunito } from "next/font/google";
import { usePathname } from "next/navigation";

import VersionBadge from "@/components/VersionBadge";

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
  const pathname = usePathname();
  const hideFooter = pathname === "/";

  return (
    <html lang="en" className="h-full">
      <body
        className={`${nunito.className} bg-slate-950 text-slate-50 antialiased min-h-screen flex flex-col`}
      >
        <div className="flex-1">{children}</div>

        {/* Global footer (hidden on main chat page) */}
        {!hideFooter && (
          <footer className="border-t border-slate-800 bg-slate-950/70 backdrop-blur">
            <div className="mx-auto max-w-5xl px-4 py-6">
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
                <Link
                  href="/for-adults"
                  className="text-slate-300 hover:text-sky-300 underline underline-offset-2"
                >
                  Parent &amp; Educator Guide
                </Link>

                <Link
                  href="/safety"
                  className="text-slate-300 hover:text-sky-300 underline underline-offset-2"
                >
                  Safety &amp; Use Guidelines
                </Link>

                <Link
                  href="/one-pager"
                  className="text-slate-300 hover:text-sky-300 underline underline-offset-2"
                >
                  One-Pager
                </Link>

                <Link
                  href="/pilot"
                  className="text-sky-300 hover:text-sky-200 underline underline-offset-2 font-semibold"
                >
                  Pilot Program
                </Link>
              </div>

              <p className="mt-3 text-center text-xs text-slate-500">
                Z-Girl is a digital hero coach for reflection and encouragement —
                not therapy and not emergency services.
              </p>
            </div>
          </footer>
        )}

        {/* Version badge (safe everywhere) */}
        <div className="fixed bottom-3 left-3 z-50">
          <VersionBadge />
        </div>

        <Analytics />
      </body>
    </html>
  );
}
