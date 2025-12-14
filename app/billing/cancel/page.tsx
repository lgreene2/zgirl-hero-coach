import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <h1 className="text-2xl font-bold">No worries 💛</h1>
        <p className="mt-2 text-sm text-slate-300">
          Checkout was canceled. You can keep using the free version anytime — and upgrade later if you want.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
        >
          Back to Z-Girl
        </Link>
      </div>
    </main>
  );
}
