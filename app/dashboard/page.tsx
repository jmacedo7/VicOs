import { DashboardNav } from "@/components/layout/dashboard-nav";

const cards = [
  ["Contatos", "0", "Nenhum contato cadastrado ainda.", "/contacts"],
  ["Contas", "0", "Nenhuma conta conectada.", "/accounts"],
  ["Receitas do mês", "R$ 0,00", "Nenhuma receita registrada.", "/finance"],
  ["Despesas do mês", "R$ 0,00", "Nenhuma despesa registrada.", "/finance"],
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardNav active="Dashboard" />
      <main className="min-w-0 flex-1">
        <div className="border-b border-slate-200 bg-white px-6 py-5 lg:px-10">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-widest text-blue-500">VicOs</p><h2 className="text-lg font-bold text-slate-950">Visão geral</h2></div>
            <Link href="/company" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Configurar empresa</Link>
          </div>
        </div>
        <section className="px-6 py-8 lg:px-10">
          <div className="mb-8"><p className="text-sm font-semibold text-blue-500">Bom dia 👋</p><h1 className="mt-1 text-3xl font-black text-slate-950">Tudo pronto para começar?</h1><p className="mt-2 text-sm text-slate-500">Tenha uma visão centralizada das operações da sua empresa.</p></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map(([title, value, helper, href]) => <Link key={title} href={href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200"><p className="text-sm font-semibold text-slate-500">{title}</p><p className="mt-3 text-3xl font-black text-slate-950">{value}</p><p className="mt-2 text-xs text-slate-400">{helper}</p></Link>)}
          </div>
          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-bold">Atividade recente</h2><p className="mt-2 text-sm text-slate-500">Suas ações e eventos importantes aparecerão aqui.</p><div className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-400">Nenhuma atividade registrada.</div></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-bold">Próximos passos</h2><div className="mt-5 space-y-3 text-sm"><Link href="/company" className="block rounded-xl border border-slate-200 p-4 hover:border-blue-300"><strong className="text-slate-900">1. Configure sua empresa</strong><span className="mt-1 block text-slate-500">Complete os dados básicos da organização.</span></Link><Link href="/contacts" className="block rounded-xl border border-slate-200 p-4 hover:border-blue-300"><strong className="text-slate-900">2. Adicione contatos</strong><span className="mt-1 block text-slate-500">Comece sua base de números e contatos.</span></Link><Link href="/team" className="block rounded-xl border border-slate-200 p-4 hover:border-blue-300"><strong className="text-slate-900">3. Monte sua equipe</strong><span className="mt-1 block text-slate-500">Convide pessoas e defina seus acessos.</span></Link></div></section>
          </div>
        </section>
      </main>
    </div>
  );
}
