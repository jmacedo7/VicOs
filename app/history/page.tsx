import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";

export default function HistoryPage() {
  return <div className="flex min-h-screen bg-slate-50"><DashboardNav active="Histórico" /><main className="flex-1 px-6 py-8 lg:px-10"><PageHeader eyebrow="Auditoria" title="Histórico" description="Acompanhe alterações e eventos importantes realizados no VicOs." /><section className="rounded-2xl border border-slate-200 bg-white p-10 text-center"><h2 className="text-xl font-bold">Nenhum evento registrado</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Criações, alterações, associações e sincronizações aparecerão aqui com data e responsável.</p></section></main></div>;
}
