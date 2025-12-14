export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(String(session_id), {
      expand: ["subscription"],
    });

    // Accept complete sessions for subscription checkout
    const ok = session.status === "complete" || session.payment_status === "paid";

    if (!ok) {
      return NextResponse.json({ isPlus: false }, { status: 200 });
    }

    const res = NextResponse.json({ isPlus: true });
    res.cookies.set({
      name: "zgirl_plus",
      value: "1",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Activation failed" }, { status: 500 });
  }
}
