"use client";

import { useEffect, useState } from "react";

type CommerceStatus = {
  sellerConfigured: boolean;
  sellerName: string | null;
  checkoutConfigured: boolean;
  configuredCheckoutCount: number;
  requiredCheckoutCount: number;
  leadDeliveryConfigured: boolean;
  leadDeliveryMode: "email" | "webhook" | "fallback";
  readyForPaidLaunch: boolean;
};

export default function CommerceActivationStatus() {
  const [status, setStatus] = useState<CommerceStatus | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/commerce/status", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data) setStatus(data as CommerceStatus);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  if (!status) return null;

  if (status.readyForPaidLaunch) {
    return (
      <section className="border-b border-emerald-300/20 bg-emerald-300/10">
        <div className="mx-auto max-w-7xl px-5 py-4 text-sm leading-6 text-emerald-50 sm:px-8 lg:px-12">
          <strong>Commercial checkout is active.</strong>{" "}
          Purchases are processed by {status.sellerName}. These product purchases are not charitable donations.
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-amber-300/20 bg-amber-300/10">
      <div className="mx-auto max-w-7xl px-5 py-4 text-sm leading-6 text-amber-50 sm:px-8 lg:px-12">
        <strong>Founding-price reservations and invoice requests are open.</strong>{" "}
        Paid checkout remains off until a commercial seller is named and the payment links are activated. No product inquiry is treated as a charitable donation.
      </div>
    </section>
  );
}
