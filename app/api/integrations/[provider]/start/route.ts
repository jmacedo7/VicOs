import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUserContext } from "@/lib/db/context";
import { buildAuthorizationUrl, isEmailProvider } from "@/lib/services/email-oauth";

export async function GET(_request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!isEmailProvider(provider)) return new NextResponse("Not found", { status: 404 });
  await getCurrentUserContext();
  try {
    const state = crypto.randomBytes(24).toString("base64url");
    const cookieStore = await cookies();
    cookieStore.set(`vicos_email_oauth_${provider}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return NextResponse.redirect(buildAuthorizationUrl(provider, state));
  } catch (error) {
    const url = new URL("/synchronization", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    url.searchParams.set("email", error instanceof Error && error.message === "EMAIL_PROVIDER_NOT_CONFIGURED" ? "missing_config" : "error");
    return NextResponse.redirect(url);
  }
}
