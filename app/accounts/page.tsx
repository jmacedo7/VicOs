import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";

export default function AccountsPage() {
  return <div className="flex min-h-screen bg-slate-50"><DashboardNav active="Contas" /><main className="flex-1 px-6 py-8 lg:px-10"><PageHeader eyebrow="Operações" title="Contas" description="Organize contas externas, plataformas, identificadores e os contatos relacionados." action="Adicionar conta" href="/accounts/new" /><section className="rounded-2xl border border-slate-200 bg-white p-10 text-center"><h2 className="text-xl font-bold">Nenhuma conta cadastrada</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Centralize suas contas e mantenha os identificadores externos organizados em um só lugar.</p><a href="/accounts/new" className="mt-5 inline-flex rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white hover:bg-blue-600">Adicionar primeira conta</a></section></main></div>;
}
