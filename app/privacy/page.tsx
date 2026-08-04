import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

const rows = [
  ["Private Reflection", "Not sent to an AI service", "Current page only, unless you choose browser saving"],
  ["7-Day Journey", "Not sent to an AI service", "Saved in this browser so you can continue"],
  ["AI Coach", "Sent to the Z-Girl server and AI provider to generate a reply", "A browser copy is saved until you clear it"],
  ["Basic site use", "Hosting, security, and analytics systems may process technical usage data", "Handled according to provider and operational settings"],
];

export default function PrivacyPage() {
  return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader /><div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 lg:py-16"><p className="section-kicker">Trust through clarity</p><h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">Privacy &amp; Data Guide</h1><p className="mt-5 text-lg leading-8 text-slate-300">Z-Girl is designed to collect less, avoid advertising, and give users clear choices. This page explains the practical difference between private reflection and the optional AI conversation.</p>
    <section className="mt-10 overflow-hidden rounded-3xl border border-white/10"><div className="grid grid-cols-1 bg-white/[.05] p-4 text-xs font-black uppercase tracking-wider text-[#76ead6] sm:grid-cols-3"><span>Experience</span><span>What leaves the device</span><span>What is saved</span></div>{rows.map(([experience, leaves, saved]) => <div key={experience} className="grid grid-cols-1 gap-2 border-t border-white/10 p-4 text-sm leading-6 sm:grid-cols-3 sm:gap-5"><strong>{experience}</strong><span className="text-slate-300">{leaves}</span><span className="text-slate-400">{saved}</span></div>)}</section>
    <div className="mt-10 grid gap-5 sm:grid-cols-2"><Info title="What we do not do"><ul><li>Sell reflection or chat content</li><li>Show targeted advertising</li><li>Create public user profiles</li><li>Require an account for the free tools</li></ul></Info><Info title="Safer use"><ul><li>Avoid names, addresses, school names, and contact details</li><li>Clear entries on a shared device</li><li>Use a trusted adult for serious or unsafe situations</li><li>Do not use Z-Girl as emergency support</li></ul></Info></div>
    <section className="mt-10 rounded-3xl border border-sky-300/20 bg-sky-300/[.06] p-6"><h2 className="font-display text-2xl font-black">Youth and institutional use</h2><p className="mt-3 leading-7 text-slate-300">The public version is a no-account reflection tool. Schools and youth organizations should not treat it as a student record, counseling record, or monitoring system. An institutional release requires a separate implementation agreement, privacy review, consent process where applicable, and de-identified outcome design.</p></section>
    <section className="mt-10 text-sm leading-7 text-slate-400"><h2 className="text-lg font-black text-white">Control and contact</h2><p className="mt-2">You can clear reflection drafts, journey entries, and AI chat history from the relevant screen. Clearing browser data may also remove local entries and installed offline copies. Downloaded journey transcripts and entries remain under your control on your device. For questions, use the <Link href="/contact" className="font-black text-sky-300 underline">contact page</Link>.</p><p className="mt-4">This guide describes the v2.2 public experience and should be reviewed whenever hosting, analytics, or AI providers change.</p></section>
  </div></main>;
}

function Info({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><h2 className="font-display text-xl font-black">{title}</h2><div className="mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 text-sm leading-6 text-slate-300">{children}</div></section>; }
