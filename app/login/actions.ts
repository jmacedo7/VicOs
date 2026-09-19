"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function checkEmailExists(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { exists: false };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("id")
    .eq("email", normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("LOGIN_CHECK_FAILED");
  }

  return { exists: Boolean(data) };
}
