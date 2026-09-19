import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/supabase/config";

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${SITE_URL}/login?next=${encodeURIComponent(`/join/${token}`)}`);
  }

  const { data: membership } = await supabase.from("users").select("id").eq("id", user.id).maybeSingle();
  if (membership) return NextResponse.redirect(`${SITE_URL}/dashboard`);

  const { error } = await (supabase as any).rpc("join_company_by_invite", { p_token: token });
  if (error) return NextResponse.redirect(`${SITE_URL}/onboarding?error=invite`);

  return NextResponse.redirect(`${SITE_URL}/dashboard`);
}
