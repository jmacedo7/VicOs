import Link from "next/link";
import { Icon } from "@/components/ui/icons";

const modules = [
  ["Contatos", "Centralize números, status e tags.", "users"],
  ["Contas", "Organize plataformas e identificadores.", "wallet"],
  ["Financeiro", "Veja entradas, despesas e resultado.", "chart"],
  ["Equipe", "Defina usuários e permissões.", "team"],
  ["Sincronização", "Acompanhe conexões e processamento.", "sync"],
  ["Histórico", "Tenha rastreabilidade das operações.", "history"],
] as const;

export default function Home() {
  const whatsapp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP;
  const whatsappHref = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Preciso de ajuda com o VicOs.")}`
    : null;

  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 md:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="vicos-orb h-10 w-10 rounded-xl"><span className="text-sm font-black text-blue-600">V</span></div>
          <div>
            <div className="text-xl font-black tracking-tight text-slate-950"><span className="text-blue-600">Vic</span>Os</div>
            <div className="text-[9px] font-bold uppercase tracking-[.2em] text-slate-400">Business OS</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" className="vicos-button-secondary hidden sm:inline-flex">Falar no WhatsApp</a>}
          <Link href="/login" className="vicos-button">Entrar <Icon name="arrow" size={15} /></Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 pb-16 pt-14 md:px-8 lg:grid-cols-[.95fr_1.05fr] lg:px-10 lg:pb-24 lg:pt-20">
        <div className="vicos-enter max-w-2xl">
          <span className="vicos-chip mb-5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Gestão centralizada</span>
          <p className="text-[11px] font-bold uppercase tracking-[.24em] text-blue-600">Your Business Operating System</p>
          <h1 className="mt-4 text-[3.35rem] font-black leading-[.98] tracking-[-.055em] text-slate-950 sm:text-6xl lg:text-[5.5rem]">
            Uma empresa.
            <span className="block text-slate-400">Um sistema.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-500 md:text-lg">
            O VicOs reúne contatos, contas, financeiro, equipe, sincronização e histórico em uma experiência simples, rápida e organizada.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/login" className="vicos-button px-6">Começar agora <Icon name="arrow" size={15} /></Link>
            <Link href="/payment-guidelines" className="vicos-button-secondary">Orientações de pagamento</Link>
          </div>
        </div>

        <div className="relative vicos-enter lg:pl-4">
          <div className="absolute -right-16 -top-10 h-48 w-48 rounded-full bg-blue-200/25 blur-3xl" />
          <div className="absolute -bottom-12 left-4 h-40 w-40 rounded-full bg-slate-200/45 blur-3xl" />
          <div className="relative vicos-glass rounded-[30px] p-3 shadow-[0_30px_80px_rgba(15,23,42,.12)]">
            <div className="rounded-[23px] border border-slate-200/60 bg-white/86 p-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-300" /><span className="h-2 w-2 rounded-full bg-slate-200" /><span className="h-2 w-2 rounded-full bg-slate-100" /></div>
                <span className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">VicOs Dashboard</span>
              </div>
              <div className="grid gap-3 pt-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contatos</p><p className="mt-2 text-2xl font-black">1.284</p></div>
                <div className="rounded-2xl bg-blue-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Resultado</p><p className="mt-2 text-2xl font-black">R$ 18,4k</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contas</p><p className="mt-2 text-2xl font-black">42</p></div>
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-[1.5fr_1fr]">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between"><p className="text-xs font-bold">Movimentação</p><span className="text-[10px] text-slate-400">6 meses</span></div>
                  <div className="mt-5 flex h-32 items-end justify-between gap-2">
                    {[42,58,48,72,64,88].map((height, index) => <div key={index} className="flex flex-1 items-end justify-center gap-1"><span className="w-2 rounded-t bg-blue-500/85" style={{height: `${height}%`}} /><span className="w-2 rounded-t bg-slate-300" style={{height: `${Math.max(12,height-28)}%`}} /></div>)}
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70">
                  <p className="text-xs font-bold">Atividade</p>
                  <div className="mt-4 space-y-4">
                    {[["Novo contato", "agora"], ["Receita registrada", "há 12 min"], ["Conta atualizada", "há 31 min"]].map(([title,time]) => <div key={title} className="flex items-center gap-2.5"><span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon name="check" size={12} /></span><div><p className="text-[11px] font-bold text-slate-700">{title}</p><p className="text-[9px] text-slate-400">{time}</p></div></div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-16 md:px-8 lg:px-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div><p className="text-[11px] font-bold uppercase tracking-[.2em] text-blue-600">Tudo conectado</p><h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">O essencial da operação, sem excesso.</h2></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(([title, description, icon]) => (
            <article key={title} className="vicos-card rounded-[22px] p-5">
              <div className="vicos-orb text-blue-600"><Icon name={icon} size={18} /></div>
              <h3 className="mt-5 text-base font-black text-slate-950">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-10 md:px-8 lg:px-10">
        <div className="vicos-glass rounded-[26px] p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div><p className="text-[11px] font-bold uppercase tracking-[.2em] text-blue-600">Suporte</p><h2 className="mt-2 text-xl font-black text-slate-950">Precisa falar com a gente?</h2><p className="mt-1 text-sm leading-6 text-slate-500">Use o canal oficial configurado para o VicOs.</p></div>
            {whatsappHref ? <a href={whatsappHref} target="_blank" rel="noreferrer" className="vicos-button-secondary shrink-0">Abrir WhatsApp <Icon name="external" size={15} /></a> : <span className="vicos-chip">Canal de atendimento em configuração</span>}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-[1440px] px-5 pb-7 pt-2 text-center text-[11px] text-slate-400 md:px-8 lg:px-10">
        © 2026 D7 Studio and João Macedo. Todos os direitos reservados.
      </footer>
    </main>
  );
}
