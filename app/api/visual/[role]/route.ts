import { NextRequest, NextResponse } from "next/server";

const ROLE_VISUALS: Record<string, string> = {
  parent: "https://images.unsplash.com/photo-1752652016199-a9ca574e08cb?auto=format&fit=crop&w=1200&q=86",
  coach: "https://images.unsplash.com/photo-1768349027535-da4842dab8ba?auto=format&fit=crop&w=1200&q=86",
  educator: "https://images.unsplash.com/photo-1758270705696-ec9caffc73dd?auto=format&fit=crop&w=1200&q=86",
  counselor: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=1200&q=86",
  faith: "https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&w=1200&q=86",
  mentor: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=86",
  family: "https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=1200&q=86",
  yourself: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=86",
};

export async function GET(_request: NextRequest, context: { params: Promise<{ role: string }> }) {
  const { role } = await context.params;
  const source = ROLE_VISUALS[role];
  if (!source) return new NextResponse("Unknown visual", { status: 404 });

  try {
    const upstream = await fetch(source, {
      headers: { "User-Agent": "ZGirl-Visual-Delivery/1.0" },
      next: { revalidate: 86400 },
    });
    if (!upstream.ok) throw new Error(`visual upstream ${upstream.status}`);
    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
        "X-ZGirl-Visual": role,
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/screenshot-wide.png", _request.url), 307);
  }
}
