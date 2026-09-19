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
  const { membership } = await getCurrentUserContext();
  if (membership.role !== "admin") throw new Error("FORBIDDEN");

  const name = requiredText(input.name, "Name", 200);
  const email = requiredText(input.email, "Email", 200).toLowerCase();

  const admin = createAdminClient();
  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: name,
        vicos_company_id: membership.company_id,
        vicos_role: input.role,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://vic-os-d7-studio.vercel.app"}/auth/callback?next=/dashboard`,
    });

  if (inviteError) throw new Error(inviteError.message);

  revalidatePath("/team");
  return { id: invited.user.id };
}
