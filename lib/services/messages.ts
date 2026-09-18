import { getCurrentUserContext } from "@/lib/db/context";

export async function getMessagesPage() {
  const { supabase, user, membership } = await getCurrentUserContext();
  const [{ data: company }, { data: users }, { data: conversations }] = await Promise.all([
    supabase.from("companies").select("chat_enabled,chat_allow_attachments").eq("id", membership.company_id).single(),
    supabase.from("users").select("id,name,email,avatar_url,job_title,presence,last_seen_at").eq("company_id", membership.company_id).order("name"),
    supabase.from("conversations").select("id,created_at,last_message_at").order("last_message_at", { ascending: false, nullsFirst: false }),
  ]);
  const conversationIds=(conversations??[]).map((conversation)=>conversation.id);
  const { data: members } = conversationIds.length
    ? await supabase.from("conversation_members").select("conversation_id,user_id,last_read_at").in("conversation_id",conversationIds)
    : { data: [] as {conversation_id:string;user_id:string;last_read_at:string|null}[] };
  return { userId:user.id, companyId:membership.company_id, role:membership.role, chatEnabled:company?.chat_enabled??true, chatAllowAttachments:company?.chat_allow_attachments??false, members:members??[], users:users??[], conversations:conversations??[] };
}