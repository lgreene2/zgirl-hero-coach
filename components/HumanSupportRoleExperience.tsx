"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export type SupportRole = {
  id: string;
  label: string;
  title: string;
  copy: string;
  accent: string;
  img: string;
  detailLabel: string;
  detailTitle: string;
  detailCopy: string;
  tools: Array<{ title: string; copy: string }>;
};

export default function HumanSupportRoleExperience({ roles }: { roles: SupportRole[] }) {
  const [selectedId, setSelectedId] = useState(roles[0]?.id ?? "parent");
  const railRef = useRef<HTMLDivElement>(null);
  const selected = roles.find((role) => role.id === selectedId) ?? roles[0];

  function chooseRole(id: string, scrollIntoView = false) {
    setSelectedId(id);
    if (scrollIntoView) {
      const el = document.getElementById(`role-card-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }

  function syncSelectionFromSwipe() {
    const rail = railRef.current;
    if (!rail) return;
    const center = rail.scrollLeft + rail.clientWidth / 2;
    let nearest: { id: string; distance: number } | null = null;
    for (const role of roles) {
      const card = document.getElementById(`role-card-${role.id}`);
      if (!card) continue;
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - center);
      if (!nearest || distance < nearest.distance) nearest = { id: role.id, distance };
    }
    if (nearest && nearest.id !== selectedId) setSelectedId(nearest.id);
  }

  if (!selected) return null;

  return (
    <>
      <section className="mx-auto max-w-[1500px] px-3 py-10 sm:px-6 lg:px-8">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[.23em] text-[#75ead7]">Choose who can help</p>
          <h2 className="mt-2 font-display text-3xl font-black sm:text-5xl">Different roles. A stronger you.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Tap a role—or swipe on mobile. The support experience below changes with you.</p>
        </div>
        <div
          ref={railRef}
          onScroll={syncSelectionFromSwipe}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-8 lg:overflow-visible"
          aria-label="Human support roles"
        >
          {roles.map((r) => {
            const active = r.id === selectedId;
            return (
              <button
                type="button"
                id={`role-card-${r.id}`}
                key={r.id}
                onClick={() => chooseRole(r.id, true)}
                aria-pressed={active}
                className={`group relative h-[390px] w-[76vw] max-w-[285px] shrink-0 snap-center overflow-hidden rounded-[1.4rem] border bg-[#0b2030] text-left shadow-xl shadow-black/25 transition duration-300 lg:h-[365px] lg:w-auto ${active ? "border-white/40 ring-2 ring-white/15" : "border-white/10"}`}
                style={{ boxShadow: `inset 0 -4px 0 ${r.accent}` }}
              >
                <img src={r.img} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#03111d] via-[#03111d]/62 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <span className="inline-flex rounded-full border border-white/20 bg-[#03111d]/80 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] backdrop-blur" style={{ color: r.accent }}>{r.label}</span>
                  <h3 className="mt-2 text-xl font-black leading-tight">{r.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-100">{r.copy}</p>
                  <span className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full border text-lg" style={{ borderColor: r.accent, color: r.accent }}>{active ? "✓" : "→"}</span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-500 lg:hidden">Swipe to change roles • tap any card to select</p>
      </section>

      <section id="role-detail" className="mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-12" aria-live="polite">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#071a29] shadow-2xl shadow-black/25 lg:grid lg:grid-cols-[.95fr_1.05fr]">
          <div className="relative min-h-[390px] lg:min-h-[520px]">
            <img src={selected.img} alt={`${selected.label} support relationship`} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#03111d]/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-[#03111d]/80 px-4 py-2 text-xs font-black uppercase tracking-[.14em] backdrop-blur" style={{ color: selected.accent }}>{selected.label} selected</div>
          </div>
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em]" style={{ color: selected.accent }}>{selected.detailLabel}</p>
                <h2 className="mt-2 font-display text-3xl font-black">{selected.detailTitle}</h2>
              </div>
              <button type="button" onClick={() => document.getElementById("role-card-parent")?.scrollIntoView({ behavior: "smooth", block: "center" })} className="rounded-full border border-white/15 px-4 py-2 text-xs font-black text-slate-200">Choose a different role</button>
            </div>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{selected.detailCopy}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/support/adaptive?role=${encodeURIComponent(selected.id)}`} className="button-primary">Prepare with {selected.label} support →</Link>
              <Link href="/reflect" className="button-secondary">Reflect privately first</Link>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {selected.tools.map((tool, index) => (
                <div key={tool.title} className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                  <p className="font-black" style={{ color: index % 2 === 0 ? selected.accent : "#75ead7" }}>{tool.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{tool.copy}</p>
                </div>
              ))}
            </div>
            <blockquote className="mt-6 rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm italic text-slate-300">“You choose the person, what to share, and the next step.” — Z-Girl</blockquote>
          </div>
        </div>
      </section>
    </>
  );
}
