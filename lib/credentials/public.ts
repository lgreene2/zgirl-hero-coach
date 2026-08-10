import "server-only";

import { credentialRpc } from "@/lib/credentials/store";

export const CREDENTIAL_PATTERN = /^ZG-(AF|ALF|IT)-\d{4}-[A-F0-9]{10}$/i;

export type VerifiedCredential = {
  credential_id: string;
  holder_name: string;
  organization: string | null;
  credential_level: string;
  scope: string;
  training_version: string;
  status: string;
  issue_date: string;
  expires_at: string;
  valid_now: boolean;
};

export function normalizeCredentialId(value: string) {
  return value.trim().toUpperCase();
}

export async function findPublicCredential(value: string): Promise<VerifiedCredential | null> {
  const credentialId = normalizeCredentialId(value);
  if (!CREDENTIAL_PATTERN.test(credentialId)) return null;
  const rows = await credentialRpc<VerifiedCredential[]>("zgirl_verify_credential", { p_credential_code: credentialId });
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

export const credentialLevelLabel: Record<string, string> = {
  authorized_facilitator: "Z-Girl Authorized Facilitator",
  authorized_lead_facilitator: "Z-Girl Authorized Lead Facilitator",
  institutional_trainer: "Z-Girl Institutional Trainer — Authorized",
};
