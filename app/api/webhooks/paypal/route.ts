import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type PaypalEvent = {
  id?: string;
  event_type?: string;
  resource?: Record<string, unknown>;
};

type PaypalAmount = {
  total?: string;
  value?: string;
  currency?: string;
  currency_code?: string;
};

async function verifyPaypalWebhook(headers: Headers, rawBody: string) {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!clientId || !clientSecret || !webhookId) return false;

  const base =
    process.env.PAYPAL_ENV === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const auth = Buffer.from(clientId + ":" + clientSecret).toString("base64");
  const tokenResponse = await fetch(base + "/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!tokenResponse.ok) return false;
  const { access_token } = (await tokenResponse.json()) as {
    access_token?: string;
  };
  if (!access_token) return false;

  const response = await fetch(
    base + "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + access_token,
        "Content-Type": "application/json",
      },
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
    },
  );

  if (!response.ok) return false;
  const result = (await response.json()) as {
    verification_status?: string;
  };
  return result.verification_status === "SUCCESS";
}

function getSubscriptionId(resource: Record<string, unknown>) {
  if (typeof resource.billing_agreement_id === "string") {
    return resource.billing_agreement_id;
  }
  if (
    typeof resource.subscription_id === "string" &&
    resource.subscription_id.length > 0
  ) {
    return resource.subscription_id;
  }
  if (typeof resource.id === "string" && resource.id.startsWith("I-")) {
    return resource.id;
  }
  return null;
}

function getAmount(resource: Record<string, unknown>) {
  const amount =
    resource.amount && typeof resource.amount === "object"
      ? (resource.amount as PaypalAmount)
      : null;

  const rawValue =
    amount?.value ??
    amount?.total ??
    (typeof resource.amount_total === "string"
      ? resource.amount_total
      : undefined);

  if (!rawValue) return null;

  const value = Number(rawValue);
  if (!Number.isFinite(value) || value < 0) return null;

  return {
    amount_cents: Math.round(value * 100),
    currency: amount?.currency_code ?? amount?.currency ?? "BRL",
  };
}

function toIso(value: unknown) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value))
    ? new Date(value).toISOString()
    : null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!(await verifyPaypalWebhook(request.headers, rawBody))) {
    return NextResponse.json(
      { error: "INVALID_PAYPAL_SIGNATURE" },
      { status: 400 },
    );
  }

  let event: PaypalEvent;
  try {
    event = JSON.parse(rawBody) as PaypalEvent;
  } catch {
    return NextResponse.json({ error: "INVALID_PAYPAL_PAYLOAD" }, { status: 400 });
  }

  if (!event.id || !event.event_type) {
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();
  const { data: inserted, error: insertError } = await admin
    .from("payment_events")
    .insert({
      provider: "paypal",
      provider_event_id: event.id,
      event_type: event.event_type,
      payload: event,
      status: "received",
    })
    .select("id")
    .maybeSingle();

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { error: "PAYMENT_EVENT_STORE_FAILED" },
      { status: 500 },
    );
  }

  const resource = event.resource ?? {};
  if (!inserted) {
    return NextResponse.json({ error: "PAYMENT_EVENT_STORE_FAILED" }, { status: 500 });
  }
  const subscriptionProviderId = getSubscriptionId(resource);

  const { data: subscription } = subscriptionProviderId
    ? await admin
        .from("subscriptions")
        .select("id,company_id,plan_id")
        .eq("provider", "paypal")
        .eq("provider_subscription_id", subscriptionProviderId)
        .maybeSingle()
    : { data: null };

  if (subscription) {
    const statusMap: Record<string, string> = {
      "BILLING.SUBSCRIPTION.ACTIVATED": "active",
      "BILLING.SUBSCRIPTION.UPDATED": "active",
      "BILLING.SUBSCRIPTION.SUSPENDED": "paused",
      "BILLING.SUBSCRIPTION.CANCELLED": "canceled",
      "BILLING.SUBSCRIPTION.EXPIRED": "canceled",
      "BILLING.SUBSCRIPTION.PAYMENT.FAILED": "past_due",
    };

    const status = statusMap[event.event_type];
    const providerPlanId =
      typeof resource.plan_id === "string" ? resource.plan_id : null;

    let planId = subscription.plan_id;

    if (
      providerPlanId &&
      (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED" ||
        event.event_type === "BILLING.SUBSCRIPTION.UPDATED")
    ) {
      const { data: providerPlan } = await admin
        .from("plans")
        .select("id")
        .eq("provider_plan_id", providerPlanId)
        .maybeSingle();

      if (providerPlan?.id) planId = providerPlan.id;
    }

    if (
      event.event_type === "BILLING.SUBSCRIPTION.CANCELLED" ||
      event.event_type === "BILLING.SUBSCRIPTION.EXPIRED"
    ) {
      const { data: freePlan } = await admin
        .from("plans")
        .select("id")
        .eq("code", "free")
        .maybeSingle();

      if (freePlan?.id) planId = freePlan.id;
    }

    const billingInfo =
      resource.billing_info && typeof resource.billing_info === "object"
        ? (resource.billing_info as Record<string, unknown>)
        : {};
    const lastPayment =
      billingInfo.last_payment && typeof billingInfo.last_payment === "object"
        ? (billingInfo.last_payment as Record<string, unknown>)
        : {};

    await admin
      .from("subscriptions")
      .update({
        plan_id: planId,
        provider_plan_id: providerPlanId,
        status: status ?? "active",
        current_period_start:
          toIso(lastPayment.time) ??
          toIso(resource.start_time),
        current_period_end: toIso(billingInfo.next_billing_time),
        cancel_at_period_end:
          resource.status === "CANCELLED" ||
          Boolean(resource.status_update_time),
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    await admin
      .from("payment_events")
      .update({
        company_id: subscription.company_id,
        status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", inserted.id);
  }

  if (event.event_type === "PAYMENT.SALE.COMPLETED") {
    const amount = getAmount(resource);
    const saleId = typeof resource.id === "string" ? resource.id : null;

    if (amount && saleId && subscriptionProviderId && subscription) {
      const invoiceProviderId =
        typeof resource.invoice_id === "string"
          ? resource.invoice_id
          : null;

      let invoiceId: string | null = null;

      if (invoiceProviderId) {
        const { data: invoice } = await admin
          .from("invoices")
          .upsert(
            {
              company_id: subscription.company_id,
              subscription_id: subscription.id,
              provider: "paypal",
              provider_invoice_id: invoiceProviderId,
              amount_cents: amount.amount_cents,
              currency: amount.currency,
              status: "paid",
              paid_at:
                toIso(resource.create_time) ?? new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "provider,provider_invoice_id" },
          )
          .select("id")
          .maybeSingle();

        invoiceId = invoice?.id ?? null;
      }

      await admin.from("payments").upsert(
        {
          company_id: subscription.company_id,
          subscription_id: subscription.id,
          invoice_id: invoiceId,
          provider: "paypal",
          provider_payment_id: saleId,
          amount_cents: amount.amount_cents,
          currency: amount.currency,
          status: "paid",
          paid_at: toIso(resource.create_time) ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider,provider_payment_id" },
      );

      await admin
        .from("subscriptions")
        .update({
          status: "active",
          current_period_end: toIso(
            (
              resource.billing_info as Record<string, unknown> | undefined
            )?.next_billing_time,
          ),
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscription.id);

      await admin
        .from("payment_events")
        .update({
          company_id: subscription.company_id,
          status: "processed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", inserted.id);
    }
  }

  if (
    event.event_type === "PAYMENT.SALE.REFUNDED" ||
    event.event_type === "PAYMENT.SALE.REVERSED"
  ) {
    const saleId = typeof resource.id === "string" ? resource.id : null;
    if (saleId && subscription) {
      await admin
        .from("payments")
        .update({
          status:
            event.event_type === "PAYMENT.SALE.REFUNDED"
              ? "refunded"
              : "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("provider", "paypal")
        .eq("provider_payment_id", saleId);

      await admin
        .from("payment_events")
        .update({
          company_id: subscription.company_id,
          status: "processed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", inserted.id);
    }
  }

  if (!subscription) {
    await admin
      .from("payment_events")
      .update({
        status: "ignored",
        error_message: "No matching VicOs subscription",
        processed_at: new Date().toISOString(),
      })
      .eq("id", inserted.id);
  }

  return NextResponse.json({ ok: true });
}
