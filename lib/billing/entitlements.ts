import "server-only";

import { getCurrentUserContext } from "@/lib/db/context";

export const PRO_FEATURES = ["email_integration","excel_integration","api_keys","advanced_sync"] as const;
export type ProFeature = (typeof PRO_FEATURES)[number];

export async function getBillingContext() {
  const { supabase, membership } = await getCurrentUserContext();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id,status,current_period_end,plan:plans(code,name,price_cents,currency,interval,features,limits)")
    .eq("company_id", membership.company_id)
    .maybeSingle();
  const plan = Array.isArray(subscription?.plan) ? subscription.plan[0] : subscription?.plan;
  return { supabase, membership, subscription, plan };
}

export async function hasFeature(feature: string) {
  const { plan, subscription } = await getBillingContext();
  if (!plan || !subscription || !["active","trialing"].includes(subscription.status)) return false;
  return Boolean((plan.features as Record<string, unknown> | null)?.[feature]);
}

export async function requireProFeature(feature: ProFeature) {
  if (!(await hasFeature(feature))) throw new Error("PRO_PLAN_REQUIRED");
}
