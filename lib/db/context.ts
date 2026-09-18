import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserContext() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("users")
    .select("id, company_id, name, email, role")
    .eq("id", user.id)
    .single();

  if (membershipError || !membership) {
    throw new Error("COMPANY_CONTEXT_NOT_FOUND");
  }

  return { supabase, user, membership };
}
