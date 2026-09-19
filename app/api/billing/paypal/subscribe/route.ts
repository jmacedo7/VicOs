import { NextResponse } from "next/server";
import { createPaypalSubscription } from "@/lib/paypal/server";
import { getCurrentUserContext } from "@/lib/db/context";
import { getBillingContext } from "@/lib/billing/entitlements";
import { CANONICAL_SITE_URL } from "@/lib/supabase/config";

export async function POST(request: Request) {
  try {
    const { membership, user } = await getCurrentUserContext();
    const { supabase } = await getBillingContext();

    const { data: plan } = await supabase
      .from("plans")
      .select("id,code,provider_plan_id")
      .eq("code", "pro")
      .maybeSingle();

    if (!plan?.provider_plan_id) {
      return NextResponse.json(
        { error: "PAYPAL_PLAN_NOT_CONFIGURED" },
        { status: 503 },
      );
    }

    const subscription = await createPaypalSubscription(
      plan.provider_plan_id,
      CANONICAL_SITE_URL + "/billing?paypal=success",
      CANONICAL_SITE_URL + "/billing?paypal=cancel",
      membership.company_id + ":" + user.id,
    );

    const approveUrl = subscription.links?.find(
      (link) => link.rel === "approve",
    )?.href;

    if (!approveUrl) {
      return NextResponse.json(
        { error: "PAYPAL_APPROVAL_URL_MISSING" },
        { status: 502 },
      );
    }

    const { error } = await supabase
      .from("subscriptions")
      .update({
        provider: "paypal",
        provider_subscription_id: subscription.id,
        provider_plan_id: plan.provider_plan_id,
        status: "incomplete",
      })
      .eq("company_id", membership.company_id);

    if (error) throw error;

    return NextResponse.json({ url: approveUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PAYPAL_SUBSCRIPTION_FAILED";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
