import { getCurrentUserContext } from "@/lib/db/context";

export async function getTasksPage() {
  const { supabase, user, membership } = await getCurrentUserContext();
  const [{ data: tasks }, { data: users }] = await Promise.all([
    supabase.from("tasks").select("id,title,description,status,priority,due_date,assignee_id,created_by,created_at,updated_at,completed_at").eq("company_id", membership.company_id).order("updated_at", { ascending: false }),
    supabase.from("users").select("id,name,role").eq("company_id", membership.company_id).order("name"),
  ]);
  return { userId:user.id, role:membership.role, tasks:tasks??[], users:users??[] };
}
