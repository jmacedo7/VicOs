import { getCurrentUserContext } from "@/lib/db/context";

export async function listFinance(options?: { from?: string; to?: string; limit?: number; offset?: number }) {
  const { supabase } = await getCurrentUserContext();
  const limit = Math.min(Math.max(options?.limit ?? 100, 1), 200);
  const offset = Math.max(options?.offset ?? 0, 0);

  let incomeQuery = supabase.from("incomes").select("*", { count: "exact" }).order("date", { ascending: false }).range(offset, offset + limit - 1);
  let expenseQuery = supabase.from("expenses").select("*", { count: "exact" }).order("due_date", { ascending: false }).range(offset, offset + limit - 1);

  if (options?.from) {
    incomeQuery = incomeQuery.gte("date", options.from);
    expenseQuery = expenseQuery.gte("due_date", options.from);
  }
  if (options?.to) {
    incomeQuery = incomeQuery.lte("date", options.to);
    expenseQuery = expenseQuery.lte("due_date", options.to);
  }

  const [incomes, expenses] = await Promise.all([incomeQuery, expenseQuery]);
  if (incomes.error) throw new Error(incomes.error.message);
  if (expenses.error) throw new Error(expenses.error.message);

  return {
    incomes: incomes.data ?? [],
    expenses: expenses.data ?? [],
    incomeCount: incomes.count ?? 0,
    expenseCount: expenses.count ?? 0,
  };
}
