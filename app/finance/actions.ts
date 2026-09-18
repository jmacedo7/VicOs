"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserContext } from "@/lib/db/context";
import { optionalText, positiveAmount, requiredText } from "@/lib/validations/core";

export async function createIncome(input: {
  description: string;
  amount: number | string;
  category?: string;
  date?: string;
  paymentMethod?: string;
  status?: string;
  notes?: string;
}) {
  const { supabase, membership } = await getCurrentUserContext();
  const { data, error } = await supabase.from("incomes").insert({
    company_id: membership.company_id,
    description: requiredText(input.description, "Description", 300),
    amount: positiveAmount(input.amount),
    category: optionalText(input.category, 120),
    date: input.date || new Date().toISOString().slice(0, 10),
    payment_method: optionalText(input.paymentMethod, 120),
    status: input.status || "paid",
    notes: optionalText(input.notes),
  }).select().single();

  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return data;
}

export async function createExpense(input: {
  description: string;
  amount: number | string;
  category?: string;
  dueDate?: string;
  paymentDate?: string;
  paymentMethod?: string;
  status?: string;
  notes?: string;
}) {
  const { supabase, membership } = await getCurrentUserContext();
  const { data, error } = await supabase.from("expenses").insert({
    company_id: membership.company_id,
    description: requiredText(input.description, "Description", 300),
    amount: positiveAmount(input.amount),
    category: optionalText(input.category, 120),
    due_date: input.dueDate || null,
    payment_date: input.paymentDate || null,
    payment_method: optionalText(input.paymentMethod, 120),
    status: input.status || "pending",
    notes: optionalText(input.notes),
  }).select().single();

  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return data;
}

export async function deleteIncome(id: string) {
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase.from("incomes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}

export async function deleteExpense(id: string) {
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}
