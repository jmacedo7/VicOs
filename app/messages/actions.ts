"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserContext } from "@/lib/db/context";

export async function createDirectConversation(otherUserId: string) {
  const { supabase } = await getCurrentUserContext();
  const { data, error } = await supabase.rpc("create_direct_conversation", { other_user_id: otherUserId });
  if (error) throw new Error(error.message);
  revalidatePath("/messages");
  return data;
}

export async function markConversationRead(conversationId: string) {
  const { supabase, user } = await getCurrentUserContext();
  const { error } = await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
}

export async function setPresence(presence: "online" | "away" | "busy" | "offline") {
  const { supabase, user } = await getCurrentUserContext();
  const { error } = await supabase
    .from("users")
    .update({ presence, last_seen_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
}
