import { NextRequest, NextResponse } from "next/server";

const DEMO_BLOCKED_PREFIXES = [
  "/support/share",
  "/support/receive",
  "/support/follow-up",
  "/coach",
  "/admin",
  "/review",
  "/api/trusted-support",
  "/api/chat",
  "/api/zgirl",
  "/api/voice",
];

function isDemoBlocked(pathname: string) {
  return DEMO_BLOCKED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const demoMode = process.env.ZGIRL_PUBLIC_DEMO_MODE !== "false";

  if (!demoMode || !isDemoBlocked(pathname)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, code: "DEMO_ACCESS_REQUIRED", error: "This live-data or metered AI capability is disabled in the public Z-Girl demo." },
      { status: 403, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  const url = request.nextUrl.clone();
  url.pathname = "/demo-access";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: [
    "/support/:path*",
    "/coach/:path*",
    "/admin/:path*",
    "/review/:path*",
    "/api/trusted-support/:path*",
    "/api/chat/:path*",
    "/api/zgirl/:path*",
    "/api/voice/:path*",
  ],
};
