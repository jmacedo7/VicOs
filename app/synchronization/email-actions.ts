"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserContext } from "@/lib/db/context";

export async function disconnectEmailIntegration(id: string) {
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase.from("email_integrations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/synchronization");
}
