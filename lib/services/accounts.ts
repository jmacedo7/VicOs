import { getCurrentUserContext } from "@/lib/db/context";

export async function listAccounts(options?: { search?: string; limit?: number; offset?: number }) {
  const { supabase } = await getCurrentUserContext();
  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100);
  const offset = Math.max(options?.offset ?? 0, 0);
  let query = supabase.from("accounts").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  if (options?.search?.trim()) {
    const search = options.search.trim().replace(/[%_]/g, "");
    query = query.or(`platform.ilike.%${search}%,display_name.ilike.%${search}%,username.ilike.%${search}%,external_id.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { data: data ?? [], count: count ?? 0, limit, offset };
}
