import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";

export default function HistoryPage() {
  return <div className="flex min-h-screen bg-slate-50"><DashboardNav active="Histórico" /><main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9"><PageHeader eyebrow="Auditoria" title="Histórico" description="Acompanhe alterações e eventos importantes realizados no VicOs." /><section className="vicos-card rounded-[22px] p-10 text-center"><h2 className="text-xl font-bold">Nenhum evento registrado</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Criações, alterações, associações e sincronizações aparecerão aqui com data e responsável.</p></section></main></div>;
}
