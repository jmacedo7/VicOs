import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUserContext } from "@/lib/db/context";
import { CANONICAL_SITE_URL } from "@/lib/supabase/config";
import { encryptSecret } from "@/lib/crypto/server";
import { exchangeCode, fetchEmailIdentity, isEmailProvider } from "@/lib/services/email-oauth";

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!isEmailProvider(provider)) return new NextResponse("Not found", { status: 404 });

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return NextResponse.redirect(`${CANONICAL_SITE_URL}/synchronization?email=invalid_callback`);

  const cookieStore = await cookies();
  const cookieName = `vicos_email_oauth_${provider}`;
  const expectedState = cookieStore.get(cookieName)?.value;
  cookieStore.delete(cookieName);
  if (!expectedState || expectedState !== state) {
    return NextResponse.redirect(`${CANONICAL_SITE_URL}/synchronization?email=invalid_state`);
  }

  try {
    const { user, membership, supabase } = await getCurrentUserContext();
    const { hasFeature } = await import("@/lib/billing/entitlements");
    if (!(await hasFeature("email_integration"))) return NextResponse.redirect(`${CANONICAL_SITE_URL}/synchronization?email=pro_required`);
    const tokens = await exchangeCode(provider, code);
    const identity = await fetchEmailIdentity(provider, tokens.access_token);
    const { data: existing } = await supabase
      .from("email_integrations")
      .select("refresh_token_encrypted")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .eq("email", identity.email)
      .maybeSingle();

    const { error } = await supabase.from("email_integrations").upsert({
      company_id: membership.company_id,
      user_id: user.id,
      provider,
      email: identity.email,
      scope: tokens.scope || null,
      access_token_encrypted: encryptSecret(tokens.access_token),
      refresh_token_encrypted: tokens.refresh_token ? encryptSecret(tokens.refresh_token) : (existing?.refresh_token_encrypted ?? null),
      token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
      status: "connected",
    }, { onConflict: "user_id,provider,email" });

    if (error) throw new Error(error.message);
    return NextResponse.redirect(`${CANONICAL_SITE_URL}/synchronization?email=connected`);
  } catch {
    return NextResponse.redirect(`${CANONICAL_SITE_URL}/synchronization?email=error`);
  }
}
