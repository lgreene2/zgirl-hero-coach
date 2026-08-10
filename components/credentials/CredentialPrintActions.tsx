"use client";

export default function CredentialPrintActions({ credentialId }: { credentialId: string }) {
  return (
    <div className="no-print flex flex-wrap gap-3">
      <button type="button" onClick={() => window.print()} className="button-primary">Print / Save PDF</button>
      <a href={`/api/credentials/card?id=${encodeURIComponent(credentialId)}`} className="button-secondary">Download credential card</a>
      <a href={`/credentials/verify?id=${encodeURIComponent(credentialId)}`} className="button-secondary">Open verifier</a>
    </div>
  );
}
