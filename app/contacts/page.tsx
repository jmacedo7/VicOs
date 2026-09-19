import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";
import { ContactsClient } from "@/components/contacts/contacts-client";
import { getCurrentUserContext } from "@/lib/db/context";
import { listContacts } from "@/lib/services/contacts";

export default async function ContactsPage() {
  const { membership } = await getCurrentUserContext();
  const { data } = await listContacts({ limit: 100 });
  return <div className="flex min-h-screen bg-slate-50"><DashboardNav active="Contatos"/><main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9"><PageHeader eyebrow="Operações" title="Contatos" description="Centralize números, identifique status, organize tags e conecte cada contato às suas contas." action="Adicionar contato" href="/contacts/new"/><ContactsClient companyId={membership.company_id} initialData={data}/></main></div>;
}