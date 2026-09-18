import { getCurrentUserContext } from "@/lib/db/context";

export async function getDocumentsPage() {
  const { supabase, user, membership } = await getCurrentUserContext();
  const [{ data: documents }, { data: users }] = await Promise.all([
    supabase.from("documents").select("id,title,content,version,created_by,updated_by,created_at,updated_at").eq("company_id", membership.company_id).is("archived_at", null).order("updated_at", { ascending: false }),
    supabase.from("users").select("id,name").eq("company_id", membership.company_id).order("name"),
  ]);
  return { userId: user.id, role: membership.role, documents: documents ?? [], users: users ?? [] };
}
