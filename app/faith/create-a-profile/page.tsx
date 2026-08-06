"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";

export default function FaithProfileIntakePage() {
  const [contact, setContact] = useState("");
  const [organization, setOrganization] = useState("");
  const [tradition, setTradition] = useState("");
  const [ages, setAges] = useState("");
  const [setting, setSetting] = useState("");
  const [values, setValues] = useState("");
  const [references, setReferences] = useState("");
  const [practices, setPractices] = useState("");
  const [avoid, setAvoid] = useState("");
  const [approver, setApprover] = useState("");
  const [accessibility, setAccessibility] = useState("");

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("Z-Girl Faith Profile Intake");
    const body = encodeURIComponent(
      [
        "Hello,",
        "",
        "I would like to begin a Z-Girl faith-profile intake.",
        "",
        `Contact name, role, and email: ${contact}`,
        `Organization or family: ${organization}`,
        `Faith tradition / denomination: ${tradition}`,
        `Age range: ${ages}`,
        `Intended setting: ${setting}`,
        `Approved values / virtues / themes: ${values}`,
        `Approved sacred-text or curriculum references: ${references}`,
        `Prayer / contemplation / closing preferences: ${practices}`,
        `Language, claims, or topics to avoid: ${avoid}`,
        `Approving leader or content owner: ${approver}`,
        `Accessibility or communication needs: ${accessibility}`,
        "",
        "I understand this intake does not imply endorsement or automatic publication. Content must be reviewed before an institution-branded profile is activated.",
      ].join("\n")
    );
    return `mailto:info@zgirlinitiative.org?subject=${subject}&body=${body}`;
  }, [contact, organization, tradition, ages, setting, values, references, practices, avoid, approver, accessibility]);

  const ready = contact.trim() && tradition.trim() && ages.trim() && setting.trim();

  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <Link href="/faith" className="text-sm font-bold text-slate-400 transition hover:text-white">← Faith &amp; Values Hub</Link>
        <div className="mt-7">
          <div className="flex flex-wrap gap-2"><span className="eyebrow">Structured onboarding</span><span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[.15em] text-amber-100">No meeting required to begin</span></div>
          <h1 className="mt-5 font-display text-4xl font-black leading-tight tracking-[-.035em] sm:text-5xl">Create a Z-Girl Faith Profile</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">Submit the language, values, references, optional practices, boundaries, and approving role your family or organization already uses. The first profiles are assembled manually so the content and governance remain clear.</p>
        </div>

        <div className="mt-8 rounded-3xl border border-amber-300/20 bg-amber-300/5 p-5 text-sm leading-7 text-slate-300">
          <strong className="text-white">Content ownership:</strong> Do not submit copyrighted full-text materials unless you own them or have permission to provide them. References, original summaries, locally written prayers, approved terminology, and links to authorized source material are preferred.
        </div>

        <form className="mt-8 space-y-5 rounded-[2rem] border border-white/10 bg-[#0a2030]/85 p-5 sm:p-8" onSubmit={(event) => { event.preventDefault(); if (ready) window.location.href = mailtoHref; }}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Contact name, role, and email *" value={contact} onChange={setContact} placeholder="Name, youth role, and email" />
            <Field label="Organization or family" value={organization} onChange={setOrganization} placeholder="Church, ministry, school, family, or group" />
            <Field label="Faith tradition or denomination *" value={tradition} onChange={setTradition} placeholder="e.g., Christian, Catholic, Baptist, CME, interfaith" />
            <Field label="Age range *" value={ages} onChange={setAges} placeholder="e.g., ages 10–13" />
          </div>
          <TextArea label="Intended setting *" value={setting} onChange={setSetting} placeholder="Family use, youth ministry, religious education, school, team ministry, retreat, small group, etc." />
          <TextArea label="Approved values, virtues, or themes" value={values} onChange={setValues} placeholder="Courage, forgiveness, service, honesty, compassion, stewardship, hope..." />
          <TextArea label="Approved sacred-text or curriculum references" value={references} onChange={setReferences} placeholder="Provide references, authorized links, or the names of materials your organization already approves." />
          <TextArea label="Prayer, contemplation, or closing preferences" value={practices} onChange={setPractices} placeholder="Optional prayer, quiet reflection, family discussion, scripture reading, journaling, or no faith-based closing." />
          <TextArea label="Language, claims, or topics to avoid" value={avoid} onChange={setAvoid} placeholder="Terms, doctrinal claims, practices, or sensitive topics that should not appear." />
          <TextArea label="Approving leader or content owner" value={approver} onChange={setApprover} placeholder="Who may review and authorize an institution-branded profile?" />
          <TextArea label="Accessibility or communication needs" value={accessibility} onChange={setAccessibility} placeholder="Shorter prompts, AAC, visual choices, reduced stimulation, multilingual support, extra processing time, etc." />

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-xs leading-5 text-slate-400">This form prepares an email in your device’s email application. The page does not store the information in a Z-Girl account or database.</div>
          <button type="submit" disabled={!ready} className="w-full rounded-2xl bg-amber-300 px-5 py-3.5 text-sm font-black text-[#201400] transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40">Prepare faith-profile intake email →</button>
        </form>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block"><span className="text-sm font-bold text-slate-200">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/65 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-300/45" /></label>;
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block"><span className="text-sm font-bold text-slate-200">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 min-h-28 w-full rounded-xl border border-white/10 bg-slate-950/65 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-300/45" /></label>;
}
