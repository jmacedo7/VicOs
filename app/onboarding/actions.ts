"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CANONICAL_SITE_URL } from "@/lib/supabase/config";

function errorCode(error: { message?: string } | null) {
  return String(error?.message ?? "").replace(/^.*?: /, "");
}

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) throw new Error("INVALID_COMPANY_NAME");
  const { error } = await (supabase as any).rpc("create_company_for_current_user", { p_name: name });
  if (error) throw new Error(errorCode(error));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function joinCompany(formData: FormData) {
  const supabase = await createClient();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) throw new Error("INVALID_COMPANY_CODE");
  const { error } = await (supabase as any).rpc("join_company_by_code", { p_code: code });
  if (error) throw new Error(errorCode(error));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function createInvite(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim() || null;
  const { data, error } = await (supabase as any).rpc("create_company_invite", { p_role: "operator", p_email: email });
  if (error) throw new Error(errorCode(error));
  const token = data?.token;
  if (!token) throw new Error("INVITE_CREATE_FAILED");
  redirect(`${CANONICAL_SITE_URL}/join/${token}`);
}
