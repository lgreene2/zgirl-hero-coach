import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/support/share",
  "/support/receive",
  "/support/follow-up",
  "/admin",
  "/review",
  "/api/trusted-support",
];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const demoMode = process.env.ZGIRL_PUBLIC_DEMO_MODE !== "false";
  const authorized = request.cookies.get("zgirl_authorized_access")?.value === "1";

  if (!demoMode || authorized || !isProtected(pathname)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, error: "This live-data capability is disabled in the public Z-Girl demo." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const url = request.nextUrl.clone();
  url.pathname = "/demo-access";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/support/:path*", "/admin/:path*", "/review/:path*", "/api/trusted-support/:path*"],
};
