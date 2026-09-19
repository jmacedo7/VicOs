import { getCurrentUserContext } from "@/lib/db/context";

function monthStart(offset = 0) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1)).toISOString().slice(0, 10);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "").slice(0, 3);
}

export async function getDashboardMetrics() {
  const { supabase, membership } = await getCurrentUserContext();
  const start = monthStart(-5);
  const companyId = membership.company_id;

  const [company, contacts, accounts, incomes, expenses, activity] = await Promise.all([
    supabase.from("companies").select("name").eq("id", companyId).single(),
    supabase.from("contacts").select("id", { count: "exact", head: true }).eq("company_id", companyId),
    supabase.from("accounts").select("id", { count: "exact", head: true }).eq("company_id", companyId),
    supabase.from("incomes").select("amount, date").eq("company_id", companyId).gte("date", start),
    supabase.from("expenses").select("amount, due_date").eq("company_id", companyId).gte("due_date", start),
    supabase.from("audit_logs").select("id, action, entity_type, entity_id, metadata, created_at, user_id").eq("company_id", companyId).order("created_at", { ascending: false }).limit(8),
  ]);

  for (const result of [company, contacts, accounts, incomes, expenses, activity]) {
    if (result.error) throw new Error(result.error.message);
  }

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
      label: monthLabel(date),
      income: 0,
      expenses: 0,
    };
  });
  const monthMap = new Map(months.map((month) => [month.key, month]));

  for (const row of incomes.data ?? []) {
    const month = monthMap.get(row.date.slice(0, 7));
    if (month) month.income += Number(row.amount);
  }
  for (const row of expenses.data ?? []) {
    const month = monthMap.get(row.due_date.slice(0, 7));
    if (month) month.expenses += Number(row.amount);
  }

  const monthIncome = months[5]?.income ?? 0;
  const monthExpenses = months[5]?.expenses ?? 0;

  return {
    companyId,
    companyName: company.data?.name ?? "Minha empresa",
    userName: membership.name,
    role: membership.role,
    contacts: contacts.count ?? 0,
    accounts: accounts.count ?? 0,
    monthIncome,
    monthExpenses,
    monthResult: monthIncome - monthExpenses,
    chart: months,
    recentActivity: activity.data ?? [],
  };
}
