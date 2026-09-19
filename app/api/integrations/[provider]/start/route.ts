import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUserContext } from "@/lib/db/context";
import { buildAuthorizationUrl, isEmailProvider } from "@/lib/services/email-oauth";
import { CANONICAL_SITE_URL } from "@/lib/supabase/config";

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!isEmailProvider(provider)) return new NextResponse("Not found", { status: 404 });

  try {
    await getCurrentUserContext();

    const state = crypto.randomBytes(24).toString("base64url");
    const cookieStore = await cookies();
    cookieStore.set(`vicos_email_oauth_${provider}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    try {
      return NextResponse.redirect(buildAuthorizationUrl(provider, state));
    } catch (error) {
      const url = new URL(`${CANONICAL_SITE_URL}/synchronization`);
      url.searchParams.set(
        "email",
        error instanceof Error && error.message === "EMAIL_PROVIDER_NOT_CONFIGURED"
          ? "missing_config"
          : "error",
      );
      return NextResponse.redirect(url);
    }
  } catch (error) {
    const url = new URL(`${CANONICAL_SITE_URL}/login`);
    url.searchParams.set("next", `/api/integrations/${provider}/start`);
    if (error instanceof Error && error.message === "COMPANY_CONTEXT_NOT_FOUND") {
      url.searchParams.set("error", "company_context");
    }
    return NextResponse.redirect(url);
  }
}
