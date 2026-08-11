"use client";

export default function PrintDecisionPacketButton() {
  return <button type="button" onClick={() => window.print()} className="button-primary print:hidden">Print / Save as PDF</button>;
}
