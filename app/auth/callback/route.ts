import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");
  const next = requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: membership } = user
        ? await supabase.from("users").select("id").eq("id", user.id).maybeSingle()
        : { data: null };

      if (!membership && next === "/dashboard") {
        return NextResponse.redirect(`${SITE_URL}/onboarding`);
      }
      return NextResponse.redirect(`${SITE_URL}${next}`);
    }
  }

  return NextResponse.redirect(`${SITE_URL}/login?error=auth_callback`);
}
