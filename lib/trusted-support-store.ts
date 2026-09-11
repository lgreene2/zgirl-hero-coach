import "server-only";

const DEFAULT_SUPABASE_URL = "https://pysoqiubmmhsbfawrrrc.supabase.co";
const DEFAULT_PUBLISHABLE_KEY = "sb_publishable_l7Xnjeb-yym4OaVmGbcnYQ_g8i9UIsX";

const SUPABASE_URL = (process.env.ZGIRL_CREDENTIAL_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
const SUPABASE_KEY = process.env.ZGIRL_CREDENTIAL_SUPABASE_PUBLISHABLE_KEY || DEFAULT_PUBLISHABLE_KEY;

export type SupportHandoffRecord = {
  id: string;
  role: string;
  age_band: string;
  supporter_name: string | null;
  brief: string;
  supporter_response: string | null;
  next_focus: string | null;
  status: "shared" | "opened" | "responded" | "closed";
  created_at: string;
  opened_at: string | null;
  responded_at: string | null;
  expires_at: string;
  mode: "supporter" | "participant";
};

async function rpc<T>(name: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!response.ok) {
    const raw = await response.text();
    if (raw.includes("handoff_not_found")) throw new Error("handoff_not_found");
    if (raw.includes("invalid_handoff_token")) throw new Error("invalid_handoff_token");
    if (raw.includes("empty_support_response")) throw new Error("empty_support_response");
    throw new Error("support_handoff_store_failed");
  }
  return (await response.json()) as T;
}

export function createSupportHandoff(input: {
  role: string;
  ageBand: string;
  supporterName?: string;
  brief: string;
  selectedFields?: string[];
}) {
  return rpc<{ id: string; supporter_token: string; participant_token: string; expires_at: string }>(
    "zgirl_create_trusted_support_handoff",
    {
      p_role: input.role,
      p_age_band: input.ageBand,
      p_supporter_name: input.supporterName || "",
      p_brief: input.brief,
      p_selected_fields: input.selectedFields || [],
    },
  );
}

export function viewSupportHandoff(token: string, mode: "supporter" | "participant") {
  return rpc<SupportHandoffRecord>("zgirl_view_trusted_support_handoff", { p_token: token, p_mode: mode });
}

export function respondSupportHandoff(token: string, supporterResponse: string, nextFocus: string) {
  return rpc<{ ok: boolean; id: string; role: string; status: string }>("zgirl_respond_trusted_support_handoff", {
    p_supporter_token: token,
    p_supporter_response: supporterResponse,
    p_next_focus: nextFocus,
  });
}

export function closeSupportHandoff(token: string) {
  return rpc<{ ok: boolean; id: string; status: string }>("zgirl_close_trusted_support_handoff", {
    p_participant_token: token,
  });
}
