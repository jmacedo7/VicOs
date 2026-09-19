import { CANONICAL_SITE_URL } from "@/lib/supabase/config";

export type EmailProvider = "google" | "microsoft";

export const emailProviderLabel: Record<EmailProvider, string> = {
  google: "Google / Gmail",
  microsoft: "Microsoft / Outlook",
};

export function isEmailProvider(value: string): value is EmailProvider {
  return value === "google" || value === "microsoft";
}

export function callbackUrl(provider: EmailProvider) {
  return `${CANONICAL_SITE_URL}/api/integrations/${provider}/callback`;
}

export function providerConfig(provider: EmailProvider) {
  if (provider === "google") {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: "https://accounts.google.com/o/oauth2/v2/auth",
      token: "https://oauth2.googleapis.com/token",
      scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
    };
  }
  return {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    authorization: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    token: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scope: "openid email profile offline_access https://graph.microsoft.com/Mail.Read",
  };
}

export function buildAuthorizationUrl(provider: EmailProvider, state: string) {
  const config = providerConfig(provider);
  if (!config.clientId || !config.clientSecret) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl(provider),
    response_type: "code",
    response_mode: "query",
    scope: config.scope,
    state,
  });
  if (provider === "google") {
    params.set("access_type", "offline");
    params.set("prompt", "consent");
  }
  return `${config.authorization}?${params.toString()}`;
}

export type EmailOAuthTokens = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
};

export async function exchangeCode(provider: EmailProvider, code: string): Promise<EmailOAuthTokens> {
  const config = providerConfig(provider);
  if (!config.clientId || !config.clientSecret) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: callbackUrl(provider),
    grant_type: "authorization_code",
  });
  const response = await fetch(config.token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const data = await response.json() as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    error?: string;
    error_description?: string;
  };
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "EMAIL_OAUTH_TOKEN_ERROR");
  }
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    scope: data.scope,
  };
}

export async function fetchEmailIdentity(provider: EmailProvider, accessToken: string) {
  const endpoint = provider === "google"
    ? "https://openidconnect.googleapis.com/v1/userinfo"
    : "https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName,displayName";
  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const data = await response.json() as {
    email?: string;
    mail?: string | null;
    userPrincipalName?: string;
  };
  if (!response.ok) throw new Error("EMAIL_IDENTITY_LOOKUP_FAILED");
  const email = provider === "google" ? data.email : (data.mail || data.userPrincipalName);
  if (!email) throw new Error("EMAIL_ADDRESS_NOT_FOUND");
  return { email: email.toLowerCase() };
}
