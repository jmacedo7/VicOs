import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";
import { AccountsClient } from "@/components/accounts/accounts-client";
import { getCurrentUserContext } from "@/lib/db/context";
import { listAccounts } from "@/lib/services/accounts";

export default async function AccountsPage() {
  const { membership } = await getCurrentUserContext();
  const { data } = await listAccounts({ limit: 100 });
  return <div className="flex min-h-screen bg-slate-50"><DashboardNav active="Contas"/><main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9"><PageHeader eyebrow="Operações" title="Contas" description="Organize contas externas, plataformas, identificadores e os contatos relacionados." action="Adicionar conta" href="/accounts/new"/><AccountsClient companyId={membership.company_id} initialData={data}/></main></div>;
}