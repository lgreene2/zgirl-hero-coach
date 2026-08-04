import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

const features = [
  ["Keyboard access", "Core navigation, forms, dialogs, and controls are designed to work without a mouse."],
  ["Visible focus", "Interactive elements show a clear focus state so keyboard users can track their position."],
  ["Voice options", "The AI Coach supports browser-based spoken output and, where available, voice input."],
  ["Matching transcripts", "Every spoken 7-Day Journey session has a visible, downloadable transcript generated from the exact text sent to the device voice."],
  ["No autoplay", "Journey audio starts only when the user selects Listen and can be stopped at any time."],
  ["Text and stimulation", "The private reflection flow includes larger-text and low-stimulation controls."],
  ["Reduced motion", "System reduced-motion preferences disable nonessential animation."],
  ["Plain language", "Prompts are short, direct, and audience-specific, with no penalty for brief answers."],
];

export default function AccessibilityPage() { return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader /><div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:py-16"><p className="section-kicker">Access is part of the product</p><h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">Accessibility</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">Z-Girl targets WCAG 2.2 Level AA and is being improved through testing with real devices, browsers, keyboards, assistive technology, youth, adults, and facilitators.</p><div className="mt-10 grid gap-4 sm:grid-cols-2">{features.map(([title, copy]) => <section key={title} className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><h2 className="font-display text-xl font-black">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-300">{copy}</p></section>)}</div><section className="mt-10 rounded-3xl border border-[#49d8c2]/25 bg-[#49d8c2]/[.06] p-6 sm:p-8"><h2 className="font-display text-2xl font-black">Known limitations and feedback</h2><p className="mt-3 leading-7 text-slate-300">Speech recognition, installation prompts, and available voices vary by device and browser. The Spanish, French, Brazilian Portuguese, and German journey tracks use matching device voices rather than unreviewed studio recordings. AI-generated text may sometimes be less clear than intended. Audio features are never the only way to complete an activity. If something blocks access, tell us the page, device, browser, and what you were trying to do through the <Link href="/contact" className="font-black text-[#9cf2e3] underline">contact page</Link>.</p></section></div></main>; }
