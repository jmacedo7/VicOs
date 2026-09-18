"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserContext } from "@/lib/db/context";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createDirectConversation(otherUserId: string) {
  const { supabase, user, membership } = await getCurrentUserContext();
  if (otherUserId === user.id) throw new Error("CANNOT_CHAT_WITH_SELF");
  const { data: other, error: otherError } = await supabase.from("users").select("id").eq("id", otherUserId).eq("company_id", membership.company_id).single();
  if (otherError || !other) throw new Error("USER_NOT_IN_COMPANY");
  const admin = createAdminClient();
  const { data: possible } = await admin.from("conversations").select("id").eq("company_id", membership.company_id);
  for (const conversation of possible ?? []) {
    const { data: members } = await admin.from("conversation_members").select("user_id").eq("conversation_id", conversation.id);
    const ids = (members ?? []).map((member) => member.user_id);
    if (ids.length === 2 && ids.includes(user.id) && ids.includes(otherUserId)) {
      return conversation.id;
    }
  }
  const { data: created, error } = await admin.from("conversations").insert({ company_id: membership.company_id, created_by: user.id }).select("id").single();
  if (error || !created) throw new Error(error?.message ?? "Não foi possível criar a conversa.");
  const { error: memberError } = await admin.from("conversation_members").insert([{conversation_id:created.id,user_id:user.id},{conversation_id:created.id,user_id:otherUserId}]);
  if (memberError) throw new Error(memberError.message);
  revalidatePath("/messages");
  return created.id;
}

export async function markConversationRead(conversationId: string) {
  const { supabase, user } = await getCurrentUserContext();
  const { error } = await supabase.from("conversation_members").update({ last_read_at: new Date().toISOString() }).eq("conversation_id", conversationId).eq("user_id", user.id);
  if (error) throw new Error(error.message);
}

export async function setPresence(presence: "online" | "away" | "busy" | "offline") {
  const { supabase, user } = await getCurrentUserContext();
  const { error } = await supabase.from("users").update({ presence, last_seen_at: new Date().toISOString() }).eq("id", user.id);
  if (error) throw new Error(error.message);
}