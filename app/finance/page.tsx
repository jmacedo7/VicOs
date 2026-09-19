import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";
import { FinanceClient } from "@/components/finance/finance-client";
import { getCurrentUserContext } from "@/lib/db/context";
import { listFinance } from "@/lib/services/finance";

export default async function FinancePage() {
  const { membership } = await getCurrentUserContext();
  const data = await listFinance({ limit: 100 });
  return <div className="flex min-h-screen bg-slate-50"><DashboardNav active="Financeiro"/><main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9"><PageHeader eyebrow="Gestão" title="Financeiro" description="Acompanhe receitas, despesas, pagamentos e o resultado da empresa com clareza." action="Nova movimentação" href="/finance/new"/><FinanceClient companyId={membership.company_id} initialIncomes={data.incomes} initialExpenses={data.expenses}/></main></div>;
}