import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";

export default function TeamPage() {
  return <div className="flex min-h-screen bg-slate-50"><DashboardNav active="Equipe" /><main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9"><PageHeader eyebrow="Organização" title="Equipe" description="Gerencie usuários, funções e níveis de acesso da sua empresa." action="Convidar membro" href="/team/invite" /><section className="vicos-card rounded-[22px] p-10 text-center"><h2 className="text-xl font-bold">Sua equipe ainda não foi configurada</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Convide colaboradores e defina quem pode visualizar, operar ou administrar cada área do VicOs.</p><a href="/team/invite" className="vicos-button mt-5">Convidar primeiro membro</a></section></main></div>;
}
