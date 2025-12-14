"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function BillingSuccessPage({ searchParams }: any) {
  const sessionId = searchParams?.session_id as string | undefined;
  const [status, setStatus] = useState<"working" | "done" | "error">("working");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    fetch("/api/billing/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((r) => r.json())
      .then((d) => setStatus(d?.isPlus ? "done" : "error"))
      .catch(() => setStatus("error"));
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <h1 className="text-2xl font-bold">You’re all set 🌟</h1>
        <p className="mt-2 text-sm text-slate-300">
          {status === "working" && "Activating your Z-Girl Plus access…"}
          {status === "done" && "Z-Girl Plus is active on this device. Welcome!"}
          {status === "error" && "We couldn’t confirm activation yet. If this keeps happening, contact support."}
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-300"
          >
            Back to Z-Girl
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950/50 px-4 py-2 text-sm font-semibold text-slate-50 hover:border-slate-500"
          >
            Close
          </Link>
        </div>
      </div>
    </main>
  );
}
