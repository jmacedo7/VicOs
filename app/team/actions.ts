"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserContext } from "@/lib/db/context";
import { requiredText } from "@/lib/validations/core";

export async function inviteTeamMember(input: {
  name: string;
  email: string;
  role: "admin" | "manager" | "operator" | "viewer";
}) {
  const { supabase, membership } = await getCurrentUserContext();
  if (membership.role !== "admin") throw new Error("FORBIDDEN");

  const name = requiredText(input.name, "Name", 200);
  const email = requiredText(input.email, "Email", 200).toLowerCase();

  const admin = createAdminClient();
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: name },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=/dashboard`,
  });

  if (inviteError) throw new Error(inviteError.message);

  const { error: membershipError } = await supabase.from("users").insert({
    id: invited.user.id,
    company_id: membership.company_id,
    name,
    email,
    role: input.role,
  });

  if (membershipError) throw new Error(membershipError.message);

  revalidatePath("/team");
  return { id: invited.user.id };
}

export async function updateTeamMemberRole(id: string, role: "admin" | "manager" | "operator" | "viewer") {
  const { supabase, membership } = await getCurrentUserContext();
  if (membership.role !== "admin") throw new Error("FORBIDDEN");
  if (id === membership.id && role !== "admin") throw new Error("CANNOT_DEMOTE_SELF");

  const { data, error } = await supabase.from("users")
    .update({ role })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/team");
  return data;
}
