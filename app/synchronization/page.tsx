import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";

export default function SynchronizationPage() {
  return <div className="flex min-h-screen bg-slate-50"><DashboardNav active="Sincronização" /><main className="flex-1 px-6 py-8 lg:px-10"><PageHeader eyebrow="Integrações" title="Sincronização" description="Conecte fontes externas e acompanhe o processamento de contatos, contas e dados." action="Adicionar integração" href="/synchronization/new" /><div className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-bold">Integrações conectadas</h2><p className="mt-2 text-sm text-slate-500">Nenhuma integração foi configurada.</p><div className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-400">Quando uma integração estiver ativa, o status, o último processamento e os registros sincronizados aparecerão aqui.</div></div></main></div>;
}
