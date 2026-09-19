import "server-only";

const API_BASE = process.env.PAYPAL_ENV === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("PAYPAL_NOT_CONFIGURED");

  const basic = Buffer.from(clientId + ":" + clientSecret).toString("base64");
  const response = await fetch(API_BASE + "/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + basic,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("PAYPAL_AUTH_FAILED");
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error("PAYPAL_TOKEN_MISSING");
  return data.access_token;
}

export async function paypalRequest<T>(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", "Bearer " + token);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  const response = await fetch(API_BASE + path, { ...init, headers, cache: "no-store" });
  const body = await response.text();
  if (!response.ok) {
    throw new Error("PAYPAL_API_" + response.status + ":" + body.slice(0, 500));
  }
  return body ? JSON.parse(body) as T : (null as T);
}

export async function createPaypalSubscription(planId: string, returnUrl: string, cancelUrl: string, customId: string) {
  return paypalRequest<{ id: string; status: string; links?: Array<{ rel: string; href: string }> }>(
    "/v1/billing/subscriptions",
    {
      method: "POST",
      headers: { "PayPal-Request-Id": crypto.randomUUID() },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: customId,
        application_context: {
          brand_name: "VicOs",
          user_action: "SUBSCRIBE_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      }),
    },
  );
}
