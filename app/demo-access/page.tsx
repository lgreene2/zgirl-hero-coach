import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function DemoAccessPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="overflow-hidden rounded-[2.2rem] border border-[#49d8c2]/20 bg-[#0b2030] shadow-2xl shadow-black/25">
          <div className="border-b border-white/10 bg-gradient-to-r from-[#49d8c2]/10 via-transparent to-[#ff4fb8]/10 p-7 sm:p-10">
            <p className="text-xs font-black uppercase tracking-[.24em] text-[#76ead6]">Z-Girl Demo</p>
            <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">Explore freely. Personal activity stays protected.</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">This public experience uses demonstrations and sample scenarios. Features that create real participant records, secure supporter handoffs, institutional activity, or private operational data require authorized access.</p>
          </div>
          <div className="grid gap-5 p-7 sm:grid-cols-2 sm:p-10">
            <div className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Available in demo</p><h2 className="mt-2 text-2xl font-black">See how Z-Girl works.</h2><p className="mt-3 text-sm leading-7 text-slate-400">Explore the product story, human-support model, market experiences, and sample reflection pathways without creating a live support record.</p><Link href="/" className="button-primary mt-6 !min-h-0">Continue exploring →</Link></div>
            <div className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-[#ff8bd0]">Authorized access</p><h2 className="mt-2 text-2xl font-black">Ready for real use?</h2><p className="mt-3 text-sm leading-7 text-slate-400">Personal secure sharing, supporter responses, pilots, institutional tools, and other live-data capabilities activate through an approved access path.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/pilot" className="button-primary !min-h-0">Request pilot access</Link><Link href="/support/visual-system" className="button-secondary !min-h-0">See human support</Link></div></div>
          </div>
          <div className="border-t border-white/10 px-7 py-5 text-xs leading-6 text-slate-500 sm:px-10">Demo mode does not authorize clinical, educational, athletic, faith, or other professional use. Trusted people remain responsible for their real-world roles.</div>
        </div>
      </section>
    </main>
  );
}
