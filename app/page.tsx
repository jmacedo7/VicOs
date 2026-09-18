import Link from "next/link";

const modules = [
  ["Contatos", "Gerencie números, status, tags e vínculos."],
  ["Contas", "Centralize contas e identificadores externos."],
  ["Financeiro", "Acompanhe receitas, despesas e resultado."],
  ["Equipe", "Organize usuários, funções e permissões."],
  ["Sincronização", "Conecte fontes externas e acompanhe sincronizações."],
  ["Histórico", "Tenha rastreabilidade das operações da empresa."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-xl font-black tracking-tight"><span className="text-blue-400">Vic</span>Os</div>
        <Link href="/login" className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold transition hover:bg-blue-600">Entrar</Link>
      </nav>
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-blue-400">Your Business Operating System</p>
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Uma empresa. <span className="text-blue-400">Um sistema.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">O VicOs centraliza contatos, contas, financeiro, equipe, integrações e histórico em um único lugar.</p>
          <Link href="/login" className="mt-8 inline-flex rounded-xl bg-blue-500 px-6 py-3 font-bold transition hover:bg-blue-600">Começar agora</Link>
        </div>
        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(([title, description]) => (
            <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
