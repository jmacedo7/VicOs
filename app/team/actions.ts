"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserContext } from "@/lib/db/context";
import { requiredText } from "@/lib/validations/core";
import { CANONICAL_SITE_URL } from "@/lib/supabase/config";

const roles = ["admin", "manager", "operator", "viewer"] as const;
type TeamRole = (typeof roles)[number];

function validateRole(value: string): TeamRole {
  if (!roles.includes(value as TeamRole)) throw new Error("INVALID_ROLE");
  return value as TeamRole;
}

export async function inviteTeamMember(input: {
  name: string;
  email: string;
  role: TeamRole;
}) {
  const { membership } = await getCurrentUserContext();
  if (membership.role !== "admin") throw new Error("FORBIDDEN");

  const name = requiredText(input.name, "Name", 200);
  const email = requiredText(input.email, "Email", 200).toLowerCase();
  const role = validateRole(input.role);

  const admin = createAdminClient();
  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: name,
        vicos_company_id: membership.company_id,
        vicos_role: role,
      },
      redirectTo: `${CANONICAL_SITE_URL}/auth/callback`,
    });

  if (inviteError) throw new Error(inviteError.message);

  revalidatePath("/team");
  return { id: invited.user.id };
}

export async function updateTeamMemberRole(userId: string, role: TeamRole) {
  const { supabase, user, membership } = await getCurrentUserContext();
  if (membership.role !== "admin") throw new Error("FORBIDDEN");
  if (userId === user.id) throw new Error("CANNOT_CHANGE_OWN_ROLE");

  const nextRole = validateRole(role);
  const { data, error } = await supabase
    .from("users")
    .update({ role: nextRole })
    .eq("id", userId)
    .eq("company_id", membership.company_id)
    .select("id,name,email,role,created_at,updated_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "MEMBER_NOT_FOUND");
  revalidatePath("/team");
  return data;
}
