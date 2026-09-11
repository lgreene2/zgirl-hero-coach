"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { assessRisk } from "@/app/lib/safety";
import {
  AGE_GUIDANCE,
  SHARE_FIELDS,
  SUPPORT_ROLES,
  buildLocalHandoff,
  getSupportRole,
  type AgeBand,
  type ShareField,
  type SupportRole,
} from "@/lib/trusted-support";

type Values = Record<ShareField, string>;

const blankValues: Values = {
  situation: "",
  feeling: "",
  theme: "",
  strength: "",
  heroMove: "",
  question: "",
};

const prompts: Record<ShareField, string> = {
  situation: "What happened or what moment do you want help talking about?",
  feeling: "What feeling or state best describes where you are right now?",
  theme: "What pressure, need, expectation, relationship, or pattern may be influencing this?",
  strength: "What strength, value, skill, person, or past win can you draw on?",
  heroMove: "What is one safe, realistic next step you want to take?",
  question: "What do you want this person to understand, discuss, or help you with?",
};

export default function SupportPage() {
  const [role, setRole] = useState<SupportRole>("parent");
  const [ageBand, setAgeBand] = useState<AgeBand>("teen");
  const [supporterName, setSupporterName] = useState("");
  const [values, setValues] = useState<Values>(blankValues);
  const [selected, setSelected] = useState<ShareField[]>(["situation", "feeling", "strength", "heroMove", "question"]);
  const [brief, setBrief] = useState("");
  const [briefSource, setBriefSource] = useState<"local" | "ai" | null>(null);
  const [aiConsent, setAiConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [supporterReflection, setSupporterReflection] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [status, setStatus] = useState("");

  const config = getSupportRole(role);
  const combined = Object.values(values).join(" ");
  const risk = useMemo(() => assessRisk(combined), [combined]);
  const shareCount = selected.filter((field) => values[field].trim()).length;

  const update = (field: ShareField, value: string) => setValues((current) => ({ ...current, [field]: value }));
  const toggleShare = (field: ShareField) => setSelected((current) => current.includes(field) ? current.filter((item) => item !== field) : [...current, field]);

  const makeLocalBrief = () => {
    const result = buildLocalHandoff({ role, ageBand, selected, values, supporterName });
    setBrief(result);
    setBriefSource("local");
    setStatus("Private brief created on this device. Review it before sharing.");
  };

  const makeAiBrief = async () => {
    if (!aiConsent || shareCount === 0 || risk.level === "high") return;
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/trusted-support/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, ageBand, supporterName, selected, values }),
      });
      const data = await response.json();
      if (data.blocked) {
        setStatus(data.reply || "Please connect with a trusted person now.");
        return;
      }
      if (!response.ok) throw new Error(data.error || "Could not create the brief.");
      setBrief(data.brief);
      setBriefSource("ai");
      setStatus(data.disclosure || "AI brief created. Review it before sharing.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create the AI brief. You can still create a private on-device brief.");
    } finally {
      setLoading(false);
    }
  };

  const copyBrief = async () => {
    if (!brief) return;
    await navigator.clipboard.writeText(brief);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const shareBrief = async () => {
    if (!brief) return;
    if (navigator.share) {
      await navigator.share({ title: "My Z-Girl Support Brief", text: brief });
      return;
    }
    await copyBrief();
  };

  const reset = () => {
    setValues(blankValues);
    setBrief("");
    setBriefSource(null);
    setSupporterReflection("");
    setNextFocus("");
    setStatus("");
    setAiConsent(false);
  };

  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-7 lg:py-12">
        <div className="max-w-4xl">
          <p className="section-kicker">Z-Girl Adaptive Support · Private by default</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight sm:text-5xl">Turn reflection into a better human conversation.</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">Reflect privately, choose exactly what you want to share, then hand off a clear brief to a parent, coach, educator, therapist, faith leader, mentor, or trusted adult. Z-Girl helps prepare the conversation—the human relationship stays in charge.</p>
        </div>

        {risk.level !== "low" && (
          <aside role="alert" className={`mt-6 rounded-3xl border p-5 ${risk.level === "high" ? "border-rose-400/50 bg-rose-400/10" : "border-amber-300/40 bg-amber-300/[.08]"}`}>
            <h2 className="font-black">Safety comes before the handoff workflow.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">If you may hurt yourself or someone else, or you are not safe, connect with a trusted person now. Z-Girl is not an emergency service. In the U.S., call or text 988 for the Suicide &amp; Crisis Lifeline; call 911 for immediate danger.</p>
            {risk.level === "high" && <a href="tel:988" className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950">Call 988</a>}
          </aside>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 shadow-2xl shadow-black/20 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">1 · Choose your support person</p><h2 className="mt-2 font-display text-2xl font-black">Who should this conversation help you reach?</h2></div>
              <span className="rounded-full border border-[#49d8c2]/30 bg-[#49d8c2]/10 px-3 py-1 text-xs font-black text-[#76ead6]">You control sharing</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SUPPORT_ROLES.map((item) => (
                <button key={item.id} type="button" onClick={() => setRole(item.id)} aria-pressed={role === item.id} className={`rounded-2xl border p-4 text-left transition ${role === item.id ? "border-[#49d8c2] bg-[#49d8c2]/10" : "border-white/10 bg-white/[.025] hover:border-white/25"}`}>
                  <span className="block font-black">{item.label}</span>
                  <span className="mt-2 block text-xs leading-5 text-slate-400">{item.description}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="age-band" className="field-label">Reflection style</label>
                <select id="age-band" value={ageBand} onChange={(e) => setAgeBand(e.target.value as AgeBand)} className="mt-2 w-full rounded-2xl border border-white/15 bg-[#071824] px-4 py-3 text-white outline-none focus:border-[#49d8c2]">
                  {Object.entries(AGE_GUIDANCE).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="supporter-name" className="field-label">Their name <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="supporter-name" value={supporterName} onChange={(e) => setSupporterName(e.target.value)} placeholder={config.label} className="mt-2 w-full rounded-2xl border border-white/15 bg-[#071824] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-[#49d8c2]" />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.025] p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Role-aware guardrails</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">{config.boundaries.map((boundary) => <li key={boundary}>• {boundary}</li>)}</ul>
            </div>

            <div className="mt-8 border-t border-white/10 pt-7">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">2 · Reflect</p>
              <h2 className="mt-2 font-display text-2xl font-black">Your words first.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Nothing below is shared automatically. Write only what feels useful for this moment.</p>
              <div className="mt-5 space-y-5">
                {SHARE_FIELDS.map((field) => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="field-label">{prompts[field.id]}</label>
                    <textarea id={field.id} value={values[field.id]} onChange={(e) => update(field.id, e.target.value)} className="reflection-field" placeholder="A few words are enough…" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">3 · Consent &amp; sharing</p>
              <h2 className="mt-2 font-display text-2xl font-black">Choose what crosses the bridge.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Unchecked items stay out of the handoff brief—even if you wrote them above.</p>
              <div className="mt-5 space-y-3">
                {SHARE_FIELDS.map((field) => (
                  <label key={field.id} className="flex cursor-pointer gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-3.5">
                    <input type="checkbox" checked={selected.includes(field.id)} onChange={() => toggleShare(field.id)} className="mt-1 h-4 w-4 accent-[#49d8c2]" />
                    <span><span className="block text-sm font-black">{field.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{field.helper}</span></span>
                  </label>
                ))}
              </div>
              <p className="mt-4 text-xs font-bold text-slate-400">{shareCount} non-empty selected item{shareCount === 1 ? "" : "s"} ready to hand off.</p>

              <div className="mt-5 grid gap-3">
                <button type="button" onClick={makeLocalBrief} disabled={shareCount === 0} className="button-primary !min-h-0 disabled:cursor-not-allowed disabled:opacity-40">Create private brief</button>
                <div className="rounded-2xl border border-sky-300/20 bg-sky-300/[.05] p-4">
                  <label className="flex cursor-pointer gap-3 text-sm leading-6 text-slate-300">
                    <input type="checkbox" checked={aiConsent} onChange={(e) => setAiConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-[#49d8c2]" />
                    <span><strong className="text-white">Optional AI polish.</strong> Send only my selected items to Z-Girl AI to make the handoff shorter and easier to discuss. I will review it before sharing.</span>
                  </label>
                  <button type="button" onClick={makeAiBrief} disabled={!aiConsent || shareCount === 0 || loading || risk.level === "high"} className="button-secondary mt-3 !min-h-0 w-full disabled:cursor-not-allowed disabled:opacity-40">{loading ? "Creating…" : "Create adaptive AI brief"}</button>
                </div>
              </div>
              {status && <p role="status" className="mt-4 whitespace-pre-line text-xs leading-5 text-slate-400">{status}</p>}
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">4 · Review &amp; hand off</p><h2 className="mt-2 font-display text-2xl font-black">Your support brief</h2></div>{briefSource && <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">{briefSource === "ai" ? "AI assisted" : "On-device"}</span>}</div>
              {brief ? (
                <>
                  <textarea value={brief} onChange={(e) => setBrief(e.target.value)} aria-label="Editable support brief" className="mt-4 min-h-[360px] w-full rounded-2xl border border-white/10 bg-[#020c15]/60 p-4 text-sm leading-6 text-slate-200 outline-none focus:border-[#49d8c2]" />
                  <p className="mt-3 text-xs leading-5 text-slate-500">Edit anything before sharing. AI-assisted text is a summary, not a diagnosis, record, or professional conclusion.</p>
                  <div className="mt-4 grid grid-cols-2 gap-3"><button onClick={copyBrief} className="button-secondary !min-h-0">{copied ? "Copied" : "Copy"}</button><button onClick={shareBrief} className="button-primary !min-h-0">Share</button></div>
                  <button onClick={() => window.print()} className="mt-3 w-full rounded-full border border-white/10 px-4 py-2.5 text-sm font-black text-slate-300 hover:border-white/25">Print / save PDF</button>
                </>
              ) : <div className="mt-4 rounded-2xl border border-dashed border-white/15 p-7 text-center text-sm leading-6 text-slate-500">Your handoff preview will appear here after you choose what to share.</div>}
            </section>
          </aside>
        </div>

        <section className="mt-6 rounded-[2rem] border border-[#49d8c2]/20 bg-[#49d8c2]/[.045] p-5 sm:p-7">
          <div className="grid gap-7 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">5 · Human response → return loop</p>
              <h2 className="mt-2 font-display text-3xl font-black">The handoff is not the end.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">After the conversation, capture only the agreed next focus—not a hidden evaluation of the participant. Z-Girl can use that next focus for future reflection and reinforcement.</p>
              <p className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4 text-xs leading-5 text-slate-400"><strong className="text-white">For {config.shortLabel}:</strong> {config.supporterPrompt}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="supporter-reflection" className="field-label">What did we agree was important?</label><textarea id="supporter-reflection" value={supporterReflection} onChange={(e) => setSupporterReflection(e.target.value)} className="reflection-field" placeholder="A shared understanding, not a diagnosis…" /></div>
              <div><label htmlFor="next-focus" className="field-label">Next focus / support action</label><textarea id="next-focus" value={nextFocus} onChange={(e) => setNextFocus(e.target.value)} className="reflection-field" placeholder="One action to practice, notice, or revisit…" /></div>
              <div className="sm:col-span-2 flex flex-wrap gap-3"><Link href="/journey" className="button-primary !min-h-0">Continue with Z-Girl</Link><Link href="/reflect" className="button-secondary !min-h-0">Start another reflection</Link><button onClick={reset} className="rounded-full px-4 py-2 text-sm font-black text-slate-400 hover:text-white">Clear this handoff</button></div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs font-black uppercase tracking-wider text-[#76ead6]">Participant owns the bridge</p><p className="mt-2 text-sm leading-6 text-slate-400">Normal reflections do not automatically become parent, school, coach, or professional reports.</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs font-black uppercase tracking-wider text-[#76ead6]">AI prepares—not decides</p><p className="mt-2 text-sm leading-6 text-slate-400">AI can adapt language and summarize selected content. Human professionals remain responsible for judgment and high-stakes decisions.</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs font-black uppercase tracking-wider text-[#76ead6]">Safety is separate</p><p className="mt-2 text-sm leading-6 text-slate-400">Urgent safety concerns are routed to appropriate human and crisis support instead of being treated as a normal sharing preference.</p></div>
        </section>
      </div>
    </main>
  );
}
