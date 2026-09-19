import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CANONICAL_SITE_URL } from "@/lib/supabase/config";

const OAUTH_NEXT_COOKIE = "vicos_oauth_next";

function safeNext(value: string | null | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cookieStore = await cookies();
  const cookieNext = cookieStore.get(OAUTH_NEXT_COOKIE)?.value;

  let decodedCookieNext = "";
  if (cookieNext) {
    try {
      decodedCookieNext = decodeURIComponent(cookieNext);
    } catch {
      decodedCookieNext = "";
    }
  }

  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next") ?? decodedCookieNext);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: membership } = user
        ? await supabase.from("users").select("id").eq("id", user.id).maybeSingle()
        : { data: null };

      const response = NextResponse.redirect(
        !membership && next === "/dashboard"
          ? `${CANONICAL_SITE_URL}/onboarding`
          : `${CANONICAL_SITE_URL}${next}`,
      );
      response.cookies.set(OAUTH_NEXT_COOKIE, "", {
        path: "/",
        maxAge: 0,
      });
      return response;
    }
  }

  const response = NextResponse.redirect(`${CANONICAL_SITE_URL}/login?error=auth_callback`);
  response.cookies.set(OAUTH_NEXT_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}
