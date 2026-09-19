"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getCurrentUserContext } from "@/lib/db/context";
import { requireProFeature } from "@/lib/billing/entitlements";

const ALLOWED_SCOPES = ["contacts:read","contacts:write","accounts:read","accounts:write","tasks:read","tasks:write","documents:read","documents:write","finance:read","finance:write","messages:read","messages:write"] as const;

export async function createApiKey(name: string, scopes: string[], expiresAt?: string) {
  await requireProFeature("api_keys");
  const { supabase, membership, user } = await getCurrentUserContext();
  if (!["admin","manager"].includes(membership.role)) throw new Error("FORBIDDEN");
  const safeName = name.trim().slice(0, 80);
  const safeScopes = [...new Set(scopes)].filter((scope): scope is typeof ALLOWED_SCOPES[number] => (ALLOWED_SCOPES as readonly string[]).includes(scope));
  if (!safeName || safeScopes.length === 0) throw new Error("INVALID_API_KEY");

  const raw = "vicos_live_" + randomBytes(24).toString("base64url");
  const prefix = raw.slice(0, 16);
  const secretHash = createHash("sha256").update(raw).digest("hex");
  const { error } = await supabase.from("api_keys").insert({company_id:membership.company_id,user_id:user.id,name:safeName,prefix,secret_hash:secretHash,scopes:safeScopes,expires_at:expiresAt ? new Date(expiresAt).toISOString() : null});
  if (error) throw new Error(error.message);
  revalidatePath("/billing");
  return { key: raw };
}

export async function revokeApiKey(id: string) {
  await requireProFeature("api_keys");
  const { supabase, membership } = await getCurrentUserContext();
  if (!["admin","manager"].includes(membership.role)) throw new Error("FORBIDDEN");
  const { error } = await supabase.from("api_keys").update({revoked_at:new Date().toISOString()}).eq("id",id).eq("company_id",membership.company_id);
  if (error) throw new Error(error.message);
  revalidatePath("/billing");
}
