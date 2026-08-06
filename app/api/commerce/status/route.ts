import { NextResponse } from "next/server";
import { commerceOffers, getCheckoutLink, getSellerName } from "@/lib/commerce";

export const dynamic = "force-dynamic";

export async function GET() {
  const checkoutOffers = commerceOffers.filter((offer) => offer.mode === "checkout");
  const configuredOffers = checkoutOffers.filter((offer) => Boolean(getCheckoutLink(offer.slug)));
  const resendConfigured = Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.ZGIRL_LEAD_EMAIL_TO?.trim() &&
      process.env.ZGIRL_LEAD_EMAIL_FROM?.trim()
  );
  const webhookConfigured = Boolean(process.env.ZGIRL_LEAD_WEBHOOK_URL?.trim());
  const sellerName = getSellerName();

  return NextResponse.json(
    {
      sellerConfigured: Boolean(sellerName),
      sellerName,
      checkoutConfigured: configuredOffers.length === checkoutOffers.length,
      configuredCheckoutCount: configuredOffers.length,
      requiredCheckoutCount: checkoutOffers.length,
      leadDeliveryConfigured: resendConfigured || webhookConfigured,
      leadDeliveryMode: resendConfigured ? "email" : webhookConfigured ? "webhook" : "fallback",
      readyForPaidLaunch:
        Boolean(sellerName) &&
        configuredOffers.length === checkoutOffers.length &&
        (resendConfigured || webhookConfigured),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
