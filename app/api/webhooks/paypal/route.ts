import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type PaypalEvent = {
  id?: string;
  event_type?: string;
  resource?: Record<string, unknown>;
};

async function verifyPaypalWebhook(headers: Headers, rawBody: string) {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!clientId || !clientSecret || !webhookId) return false;

  const base = process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  const auth = Buffer.from(clientId + ":" + clientSecret).toString("base64");
  const tokenResponse = await fetch(base + "/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: "Basic " + auth, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!tokenResponse.ok) return false;
  const { access_token } = await tokenResponse.json() as { access_token?: string };
  if (!access_token) return false;

  const response = await fetch(base + "/v1/notifications/verify-webhook-signature", {
    method: "POST",
    headers: { Authorization: "Bearer " + access_token, "Content-Type": "application/json" },
    body: JSON.stringify({
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_time: headers.get("paypal-transmission-time"),
      cert_url: headers.get("paypal-cert-url"),
      auth_algo: headers.get("paypal-auth-algo"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
    cache: "no-store",
  });
  if (!response.ok) return false;
  const result = await response.json() as { verification_status?: string };
  return result.verification_status === "SUCCESS";
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!(await verifyPaypalWebhook(request.headers, rawBody))) {
    return NextResponse.json({ error: "INVALID_PAYPAL_SIGNATURE" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as PaypalEvent;
  if (!event.id || !event.event_type) return NextResponse.json({ ok: true });

  const admin = createAdminClient();
  const { data: inserted, error: insertError } = await admin.from("payment_events").insert({
    provider: "paypal",
    provider_event_id: event.id,
    event_type: event.event_type,
    payload: event,
    status: "received",
  }).select("id").maybeSingle();

  if (insertError) {
    if (insertError.code === "23505") return NextResponse.json({ ok: true });
    return NextResponse.json({ error: "PAYMENT_EVENT_STORE_FAILED" }, { status: 500 });
  }

  const resource = event.resource ?? {};
  const subscriptionId = typeof resource.id === "string" ? resource.id :
    typeof resource.billing_agreement_id === "string" ? resource.billing_agreement_id : null;

  if (subscriptionId) {
    const { data: subscription } = await admin.from("subscriptions")
      .select("id,company_id")
      .eq("provider","paypal")
      .eq("provider_subscription_id",subscriptionId)
      .maybeSingle();

    if (subscription) {
      const statusMap: Record<string,string> = {
        "BILLING.SUBSCRIPTION.ACTIVATED":"active",
        "BILLING.SUBSCRIPTION.UPDATED":"active",
        "BILLING.SUBSCRIPTION.SUSPENDED":"paused",
        "BILLING.SUBSCRIPTION.CANCELLED":"canceled",
        "BILLING.SUBSCRIPTION.EXPIRED":"canceled",
        "BILLING.SUBSCRIPTION.PAYMENT.FAILED":"past_due",
      };
      const status = statusMap[event.event_type];
      if (status) {
        await admin.from("subscriptions").update({status,updated_at:new Date().toISOString()}).eq("id",subscription.id);
      }
      await admin.from("payment_events").update({company_id:subscription.company_id,status:"processed",processed_at:new Date().toISOString()}).eq("id",inserted.id);
    }
  }

  return NextResponse.json({ ok: true });
}
