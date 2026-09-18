"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserContext } from "@/lib/db/context";
import { requiredText } from "@/lib/validations/core";

export async function createTag(name: string) {
  const { supabase, membership } = await getCurrentUserContext();
  const { data, error } = await supabase.from("tags")
    .insert({ company_id: membership.company_id, name: requiredText(name, "Tag", 80) })
    .select().single();
  if (error) throw new Error(error.code === "23505" ? "TAG_ALREADY_EXISTS" : error.message);
  revalidatePath("/tags");
  return data;
}

export async function deleteTag(id: string) {
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tags");
}
