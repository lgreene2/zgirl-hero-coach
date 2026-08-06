import { NextResponse } from "next/server";
import { getCheckoutLink, getCommerceOffer } from "@/lib/commerce";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ offer: string }> }
) {
  const { offer: slug } = await params;
  const offer = getCommerceOffer(slug);
  const origin = new URL(request.url).origin;

  if (!offer) {
    return NextResponse.redirect(new URL("/store?status=offer-not-found", origin), 303);
  }

  if (offer.mode === "inquiry") {
    return NextResponse.redirect(
      new URL(`/partners?offer=${encodeURIComponent(slug)}#interest`, origin),
      303
    );
  }

  const checkoutLink = getCheckoutLink(slug);
  if (checkoutLink) {
    return NextResponse.redirect(checkoutLink, 303);
  }

  return NextResponse.redirect(
    new URL(
      `/store?status=checkout-pending&offer=${encodeURIComponent(slug)}#interest`,
      origin
    ),
    303
  );
}
