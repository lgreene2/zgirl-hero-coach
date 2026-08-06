"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-[#49d8c2] px-5 py-3 text-sm font-black text-[#04151c] transition hover:bg-[#76ead6] print:hidden"
    >
      Print or save as PDF
    </button>
  );
}
