import { getCurrentUserContext } from "@/lib/db/context";

export async function listAuditLogs(limit = 100) {
  const { supabase } = await getCurrentUserContext();
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  const { data, error } = await supabase.from("audit_logs")
    .select("id, user_id, action, entity_type, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) throw new Error(error.message);
  return data ?? [];
}
