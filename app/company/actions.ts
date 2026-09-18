"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserContext } from "@/lib/db/context";
import { optionalText, requiredText } from "@/lib/validations/core";

export async function updateCompany(input: { name: string; document?: string; phone?: string; email?: string; address?: string; city?: string; state?: string; businessSegment?: string; industry?: string; description?: string; logoUrl?: string; themePrimary?: string; themeSecondary?: string; chatEnabled?: boolean; chatAllowAttachments?: boolean; chatRetentionDays?: number; }) {
  const { supabase, membership } = await getCurrentUserContext();
  if (membership.role !== "admin") throw new Error("FORBIDDEN");
  const { data, error } = await supabase.from("companies").update({
    name: requiredText(input.name, "Company name", 200), document: optionalText(input.document, 40), phone: optionalText(input.phone, 40), email: optionalText(input.email, 200), address: optionalText(input.address, 300), city: optionalText(input.city, 120), state: optionalText(input.state, 80), business_segment: optionalText(input.businessSegment, 120), industry: optionalText(input.industry, 120), description: optionalText(input.description, 1000), logo_url: optionalText(input.logoUrl, 1000), theme_primary: optionalText(input.themePrimary, 20), theme_secondary: optionalText(input.themeSecondary, 20), chat_enabled: input.chatEnabled ?? true, chat_allow_attachments: input.chatAllowAttachments ?? false, chat_retention_days: Math.max(0, Math.floor(input.chatRetentionDays ?? 0)),
  }).eq("id", membership.company_id).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/company"); revalidatePath("/company/personalization"); revalidatePath("/dashboard");
  return data;
}
