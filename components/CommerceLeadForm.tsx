"use client";

import { FormEvent, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { commerceOffers } from "@/lib/commerce";

type CommerceLeadFormProps = {
  leadType: "product-interest" | "founding-partner" | "faith-profile" | "team-pilot";
  defaultOffer?: string;
  heading?: string;
  intro?: string;
  submitLabel?: string;
  showOfferSelect?: boolean;
};

type FormState = {
  offer: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  audience: string;
  timeline: string;
  message: string;
  consent: boolean;
  website: string;
};

const initialState: FormState = {
  offer: "",
  name: "",
  email: "",
  organization: "",
  role: "",
  audience: "",
  timeline: "",
  message: "",
  consent: false,
  website: "",
};

export default function CommerceLeadForm({
  leadType,
  defaultOffer = "",
  heading = "Tell us what you are interested in.",
  intro = "Submit the short form and Z-Girl will follow up with the appropriate product, license, or pilot path.",
  submitLabel = "Send inquiry",
  showOfferSelect = true,
}: CommerceLeadFormProps) {
  const pathname = usePathname();
  const [form, setForm] = useState<FormState>({
    ...initialState,
    offer: defaultOffer,
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "fallback" | "error"
  >("idle");
  const [leadId, setLeadId] = useState("");

  const selectedOffer = commerceOffers.find(
    (offer) => offer.slug === form.offer
  );

  const fallbackMailto = useMemo(() => {
    const subject = encodeURIComponent(
      `Z-Girl inquiry: ${selectedOffer?.title || form.offer || leadType}`
    );
    const body = encodeURIComponent(
      [
        "Hello,",
        "",
        "I would like information about the following Z-Girl offer.",
        "",
        `Offer: ${selectedOffer?.title || form.offer || "Not selected"}`,
        `Name: ${form.name}`,
        `Email: ${form.email}`,
        `Organization: ${form.organization}`,
        `Role: ${form.role}`,
        `Audience / group: ${form.audience}`,
        `Timeline: ${form.timeline}`,
        "",
        "Message:",
        form.message,
      ].join("\n")
    );
    return `mailto:info@zgirlinitiative.org?subject=${subject}&body=${body}`;
  }, [form, leadType, selectedOffer]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          leadType,
          sourcePath: pathname,
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        leadId?: string;
        code?: string;
      };

      if (response.ok && result.ok) {
        setLeadId(result.leadId || "received");
        setStatus("success");
        setForm({ ...initialState, offer: defaultOffer });
        return;
      }

      if (
        result.code === "DELIVERY_NOT_CONFIGURED" ||
        result.code === "DELIVERY_FAILED"
      ) {
        setStatus("fallback");
        return;
      }

      setStatus("error");
    } catch {
      setStatus("fallback");
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0a2030]/85 p-5 shadow-xl shadow-black/15 sm:p-8">
      <h2 className="font-display text-3xl font-black">{heading}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{intro}</p>

      {status === "success" ? (
        <div className="mt-7 rounded-2xl border border-[#49d8c2]/30 bg-[#49d8c2]/10 p-5">
          <p className="text-lg font-black text-[#a6f5e8]">Inquiry received.</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Your reference is {leadId}. Z-Girl will follow up using the email you provided.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-4 text-sm font-black text-white underline decoration-white/30 underline-offset-4"
          >
            Submit another inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-7 space-y-5">
          <div className="pointer-events-none absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label>
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(event) => update("website", event.target.value)}
              />
            </label>
          </div>

          {showOfferSelect && (
            <label className="block">
              <span className="text-sm font-bold text-slate-200">Offer or pathway</span>
              <select
                value={form.offer}
                onChange={(event) => update("offer", event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/75 px-4 py-3 text-sm text-white outline-none focus:border-[#49d8c2]/50"
              >
                <option value="">Choose an offer</option>
                {commerceOffers.map((offer) => (
                  <option key={offer.slug} value={offer.slug}>
                    {offer.title} — {offer.priceLabel}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name *" value={form.name} onChange={(value) => update("name", value)} required />
            <Field label="Email *" value={form.email} onChange={(value) => update("email", value)} type="email" required />
            <Field label="Organization" value={form.organization} onChange={(value) => update("organization", value)} />
            <Field label="Role or title" value={form.role} onChange={(value) => update("role", value)} />
            <Field label="Audience, team, or group" value={form.audience} onChange={(value) => update("audience", value)} />
            <Field label="Desired timeline" value={form.timeline} onChange={(value) => update("timeline", value)} placeholder="This month, fall semester, upcoming season..." />
          </div>

          <label className="block">
            <span className="text-sm font-bold text-slate-200">What would make this useful?</span>
            <textarea
              value={form.message}
              onChange={(event) => update("message", event.target.value)}
              className="mt-2 min-h-32 w-full rounded-xl border border-white/10 bg-slate-950/75 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#49d8c2]/50"
              placeholder="Share the need, group size, goals, questions, or customization requirements. Do not include private youth, medical, or safeguarding information."
              maxLength={3000}
            />
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-6 text-slate-300">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(event) => update("consent", event.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 rounded border-slate-500 bg-slate-950"
              required
            />
            I agree that Z-Girl may use this information to respond to my product, license, or pilot inquiry. I am not submitting private information about a child or athlete.
          </label>

          {status === "fallback" && (
            <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-slate-200">
              The secure delivery connection is not active yet. Your information has not been stored. Use the prepared email below so the inquiry is not lost.
              <a href={fallbackMailto} className="mt-3 block font-black text-amber-200 underline underline-offset-4">
                Open prepared email →
              </a>
            </div>
          )}

          {status === "error" && (
            <div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 p-4 text-sm leading-6 text-slate-200">
              Please review the required fields and try again. You may also email info@zgirlinitiative.org.
            </div>
          )}

          <button
            type="submit"
            disabled={status === "submitting" || !form.name || !form.email || !form.consent}
            className="w-full rounded-2xl bg-[#49d8c2] px-5 py-3.5 text-sm font-black text-[#04151c] transition hover:bg-[#76ead6] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "submitting" ? "Sending…" : `${submitLabel} →`}
          </button>
        </form>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/75 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#49d8c2]/50"
      />
    </label>
  );
}
