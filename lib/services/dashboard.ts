import { getCurrentUserContext } from "@/lib/db/context";

function monthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

export async function getDashboardMetrics() {
  const { supabase, membership } = await getCurrentUserContext();
  const start = monthStart();

  const [contacts, accounts, incomes, expenses, activity] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("accounts").select("id", { count: "exact", head: true }),
    supabase.from("incomes").select("amount").gte("date", start),
    supabase.from("expenses").select("amount").gte("due_date", start),
    supabase.from("audit_logs").select("id, action, entity_type, entity_id, metadata, created_at, user_id").order("created_at", { ascending: false }).limit(10),
  ]);

  for (const result of [contacts, accounts, incomes, expenses, activity]) {
    if (result.error) throw new Error(result.error.message);
  }

  const incomeTotal = (incomes.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  const expenseTotal = (expenses.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);

  return {
    companyId: membership.company_id,
    role: membership.role,
    contacts: contacts.count ?? 0,
    accounts: accounts.count ?? 0,
    monthIncome: incomeTotal,
    monthExpenses: expenseTotal,
    monthResult: incomeTotal - expenseTotal,
    recentActivity: activity.data ?? [],
  };
}
