import { NextResponse } from "next/server";
import { createPaypalSubscription } from "@/lib/paypal/server";
import { getCurrentUserContext } from "@/lib/db/context";
import { getBillingContext } from "@/lib/billing/entitlements";

export async function POST(request: Request) {
  try {
    const { membership, user } = await getCurrentUserContext();
    const { supabase } = await getBillingContext();
    const { data: plan } = await supabase.from("plans").select("id,code,provider_plan_id").eq("code","pro").maybeSingle();

    if (!plan?.provider_plan_id) {
      return NextResponse.json({ error: "PAYPAL_PLAN_NOT_CONFIGURED" }, { status: 503 });
    }

    const origin = new URL(request.url).origin;
    const subscription = await createPaypalSubscription(
      plan.provider_plan_id,
      origin + "/billing?paypal=success",
      origin + "/billing?paypal=cancel",
      membership.company_id + ":" + user.id,
    );

    const approveUrl = subscription.links?.find((link) => link.rel === "approve")?.href;
    if (!approveUrl) return NextResponse.json({ error: "PAYPAL_APPROVAL_URL_MISSING" }, { status: 502 });

    const { error } = await supabase.from("subscriptions").update({
      provider: "paypal",
      provider_subscription_id: subscription.id,
      provider_plan_id: plan.provider_plan_id,
      status: "incomplete",
    }).eq("company_id", membership.company_id);

    if (error) throw error;
    return NextResponse.json({ url: approveUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PAYPAL_SUBSCRIPTION_FAILED";
    const status = message === "PRO_PLAN_REQUIRED" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
