import "server-only";

import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type ApiKeyIdentity = {
  id: string;
  companyId: string;
  userId: string;
  scopes: string[];
};

export async function authenticateApiKey(request: Request, requiredScope?: string): Promise<ApiKeyIdentity | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const raw = header.slice(7).trim();
  if (!raw.startsWith("vicos_live_") || raw.length < 30) return null;

  const hash = createHash("sha256").update(raw).digest("hex");
  const admin = createAdminClient();
  const { data: key } = await admin
    .from("api_keys")
    .select("id,company_id,user_id,scopes,expires_at,revoked_at")
    .eq("secret_hash", hash)
    .maybeSingle();

  if (!key || key.revoked_at) return null;
  if (key.expires_at && new Date(key.expires_at).getTime() <= Date.now()) return null;

  const scopes = Array.isArray(key.scopes) ? key.scopes : [];
  if (requiredScope && !scopes.includes(requiredScope)) return null;

  await admin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", key.id);

  return {
    id: key.id,
    companyId: key.company_id,
    userId: key.user_id,
    scopes,
  };
}
