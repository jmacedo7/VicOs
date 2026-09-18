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
  const whatsapp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP;
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Preciso de ajuda com o VicOs.")}` : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-xl font-black tracking-tight"><span className="text-blue-400">Vic</span>Os</div>
        <div className="flex items-center gap-3">
          {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-slate-900">Falar no WhatsApp</a>}
          <Link href="/login" className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold transition hover:bg-blue-600">Entrar</Link>
        </div>
      </nav>
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-blue-400">Your Business Operating System</p>
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Uma empresa. <span className="text-blue-400">Um sistema.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">O VicOs centraliza contatos, contas, financeiro, equipe, integrações e histórico em um único lugar.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="inline-flex rounded-xl bg-blue-500 px-6 py-3 font-bold transition hover:bg-blue-600">Começar agora</Link>
            <Link href="/payment-guidelines" className="inline-flex rounded-xl border border-slate-700 px-6 py-3 font-bold text-slate-200 hover:bg-slate-900">Orientações de pagamento</Link>
          </div>
        </div>
        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(([title, description]) => (
            <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
        <section className="mt-12 rounded-3xl border border-blue-900/50 bg-blue-950/30 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Precisa de ajuda?</p>
          <h2 className="mt-2 text-2xl font-black">Fale com o suporte do VicOs</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Quando o número oficial estiver configurado, o botão abaixo abre diretamente uma conversa no WhatsApp com uma mensagem inicial pronta.</p>
          {whatsappHref ? <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-xl bg-green-500 px-5 py-3 font-bold text-white hover:bg-green-600">Abrir conversa no WhatsApp</a> : <p className="mt-5 rounded-xl bg-slate-900 p-4 text-sm text-slate-400">Configure NEXT_PUBLIC_SUPPORT_WHATSAPP para ativar o botão de atendimento.</p>}
        </section>
      </section>
    </main>
  );
}
