import Link from "next/link";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Icon } from "@/components/ui/icons";
import { getDashboardMetrics } from "@/lib/services/dashboard";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

function compact(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function activityText(action: string, entityType: string) {
  const entity = {
    contacts: "contato",
    accounts: "conta",
    incomes: "receita",
    expenses: "despesa",
    tags: "tag",
    users: "membro da equipe",
  }[entityType] ?? "registro";

  const actionLabel = {
    CREATE: "criou",
    UPDATE: "atualizou",
    DELETE: "removeu",
    ASSOCIATE: "associou",
    DISASSOCIATE: "desassociou",
    SYNC: "sincronizou",
    SYNC_FAILED: "teve falha ao sincronizar",
  }[action] ?? "alterou";

  return `${actionLabel} um ${entity}`;
}

function timeAgo(date: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const maxChart = Math.max(1, ...metrics.chart.flatMap((month) => [month.income, month.expenses]));

  return (
    <div className="flex min-h-screen">
      <DashboardNav active="Dashboard" />

      <main className="vicos-mobile-main min-w-0 flex-1">
        <header className="vicos-glass sticky top-0 z-30 border-x-0 border-t-0 px-5 py-3.5 md:px-8 lg:px-10">
          <div className="mx-auto flex max-w-[1480px] items-center gap-4">
            <div className="hidden min-w-0 items-center gap-2 text-xs text-slate-400 md:flex">
              <span>Workspace</span>
              <span>/</span>
              <span className="font-semibold text-slate-700">Dashboard</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <label className="hidden h-10 w-[220px] items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 text-sm text-slate-400 shadow-sm lg:flex">
                <Icon name="search" size={16} />
                <input
                  aria-label="Pesquisar no VicOs"
                  placeholder="Pesquisar..."
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
                />
                <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">⌘ K</kbd>
              </label>

              <button aria-label="Notificações" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200/70 bg-white/70 text-slate-500 shadow-sm transition hover:bg-white">
                <Icon name="bell" size={17} />
              </button>

              <Link href="/company" className="hidden items-center gap-2.5 rounded-xl border border-slate-200/70 bg-white/70 px-2.5 py-1.5 shadow-sm transition hover:bg-white sm:flex">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-900 text-[10px] font-black text-white">
                  {(metrics.userName || "JM").slice(0, 2).toUpperCase()}
                </span>
                <span className="pr-1 text-xs font-bold text-slate-700">Minha conta</span>
              </Link>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[1480px] px-5 py-7 md:px-8 lg:px-10 lg:py-9">
          <div className="vicos-enter mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="vicos-chip">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Operação ativa
                </span>
                <span className="text-xs text-slate-400">{metrics.companyName}</span>
              </div>
              <h1 className="max-w-3xl text-[2.25rem] font-black tracking-[-.045em] text-slate-950 md:text-[3.35rem]">
                Olá, {metrics.userName?.split(" ")[0] || "João"}.
                <span className="block text-slate-400">Aqui está sua visão geral.</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Tudo o que importa para a operação da sua empresa, reunido em um só lugar.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/history" className="vicos-button-secondary">
                <Icon name="history" size={15} />
                Atividade
              </Link>
              <Link href="/finance/new" className="vicos-button">
                <Icon name="plus" size={16} strokeWidth={2} />
                Nova movimentação
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Link href="/contacts" className="vicos-card group relative overflow-hidden rounded-[22px] p-5 vicos-enter">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Contatos</p>
                  <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{compact(metrics.contacts)}</p>
                  <p className="mt-1 text-xs text-slate-500">na base operacional</p>
                </div>
                <div className="vicos-orb vicos-float text-blue-600">
                  <Icon name="users" size={19} />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-blue-600">
                Gerenciar contatos <Icon name="arrow" size={13} />
              </div>
            </Link>

            <Link href="/accounts" className="vicos-card group relative overflow-hidden rounded-[22px] p-5 vicos-enter">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Contas</p>
                  <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{compact(metrics.accounts)}</p>
                  <p className="mt-1 text-xs text-slate-500">identificadores cadastrados</p>
                </div>
                <div className="vicos-orb text-slate-700">
                  <Icon name="wallet" size={19} />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-blue-600">
                Ver contas <Icon name="arrow" size={13} />
              </div>
            </Link>

            <Link href="/finance" className="vicos-card group rounded-[22px] p-5 vicos-enter">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Receitas · mês</p>
                  <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{currency(metrics.monthIncome)}</p>
                  <p className="mt-1 text-xs text-slate-500">entradas registradas</p>
                </div>
                <div className="vicos-orb text-emerald-600">
                  <Icon name="chart" size={19} />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-blue-600">
                Abrir financeiro <Icon name="arrow" size={13} />
              </div>
            </Link>

            <Link href="/finance" className="vicos-card group rounded-[22px] p-5 vicos-enter">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Resultado · mês</p>
                  <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{currency(metrics.monthResult)}</p>
                  <p className="mt-1 text-xs text-slate-500">receitas menos despesas</p>
                </div>
                <div className="vicos-orb text-violet-600">
                  <Icon name="chart" size={19} />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-blue-600">
                Detalhar resultado <Icon name="arrow" size={13} />
              </div>
            </Link>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(310px,.8fr)]">
            <section className="vicos-card overflow-hidden rounded-[24px] p-6 md:p-7 vicos-enter">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Financeiro</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    <span className="text-[11px] font-semibold text-slate-400">Últimos 6 meses</span>
                  </div>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">Movimentação financeira</h2>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Receitas</span>
                  <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Despesas</span>
                </div>
              </div>

              <div className="vicos-chart-grid mt-8 grid h-[260px] grid-cols-6 items-end gap-3 rounded-2xl px-3 pt-5 md:gap-6 md:px-5">
                {metrics.chart.map((month) => {
                  const incomeHeight = Math.max(4, (month.income / maxChart) * 100);
                  const expenseHeight = Math.max(4, (month.expenses / maxChart) * 100);
                  return (
                    <div key={month.key} className="flex h-full flex-col justify-end">
                      <div className="flex h-full items-end justify-center gap-1.5">
                        <div
                          title={`Receitas: ${currency(month.income)}`}
                          className="w-[clamp(10px,2.5vw,24px)] rounded-t-[7px] bg-blue-500/90 transition-all duration-500"
                          style={{ height: `${incomeHeight}%` }}
                        />
                        <div
                          title={`Despesas: ${currency(month.expenses)}`}
                          className="w-[clamp(10px,2.5vw,24px)] rounded-t-[7px] bg-slate-300 transition-all duration-500"
                          style={{ height: `${expenseHeight}%` }}
                        />
                      </div>
                      <span className="mt-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">{month.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50/80 p-4">
                  <p className="text-[11px] font-semibold text-slate-400">Receitas</p>
                  <p className="mt-1 text-lg font-black text-slate-900">{currency(metrics.monthIncome)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50/80 p-4">
                  <p className="text-[11px] font-semibold text-slate-400">Despesas</p>
                  <p className="mt-1 text-lg font-black text-slate-900">{currency(metrics.monthExpenses)}</p>
                </div>
                <div className="rounded-2xl bg-blue-50/70 p-4 ring-1 ring-blue-100/80">
                  <p className="text-[11px] font-semibold text-blue-500">Resultado</p>
                  <p className="mt-1 text-lg font-black text-slate-900">{currency(metrics.monthResult)}</p>
                </div>
              </div>
            </section>

            <section className="vicos-card rounded-[24px] p-6 md:p-7 vicos-enter">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Atividade</span>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">Recentes</h2>
                </div>
                <Link href="/history" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200/70 bg-white/70 text-slate-500 hover:bg-white">
                  <Icon name="external" size={15} />
                </Link>
              </div>

              {metrics.recentActivity.length ? (
                <div className="mt-6 divide-y divide-slate-100/80">
                  {metrics.recentActivity.map((item) => (
                    <div key={item.id} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon name={item.action === "SYNC" ? "sync" : item.action === "DELETE" ? "history" : "check"} size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-5 text-slate-700">{activityText(item.action, item.entity_type)}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{timeAgo(item.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/65 p-6 text-center">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-400 shadow-sm">
                    <Icon name="history" size={18} />
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-700">Sem atividade ainda</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">As movimentações da sua equipe aparecerão aqui.</p>
                </div>
              )}

              <Link href="/history" className="mt-5 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/70 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-slate-900">
                Ver histórico completo
                <Icon name="arrow" size={13} />
              </Link>
            </section>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Link href="/contacts/new" className="vicos-surface group rounded-[20px] p-5 transition hover:-translate-y-0.5 hover:bg-white">
              <div className="flex items-center justify-between">
                <div className="vicos-orb h-10 w-10 rounded-xl text-blue-600"><Icon name="users" size={17} /></div>
                <Icon name="arrow" size={15} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />
              </div>
              <p className="mt-4 text-sm font-black text-slate-900">Adicionar contato</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Cadastre um novo número na operação.</p>
            </Link>

            <Link href="/accounts/new" className="vicos-surface group rounded-[20px] p-5 transition hover:-translate-y-0.5 hover:bg-white">
              <div className="flex items-center justify-between">
                <div className="vicos-orb h-10 w-10 rounded-xl text-slate-700"><Icon name="wallet" size={17} /></div>
                <Icon name="arrow" size={15} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />
              </div>
              <p className="mt-4 text-sm font-black text-slate-900">Adicionar conta</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Organize uma conta ou identificador externo.</p>
            </Link>

            <Link href="/team/invite" className="vicos-surface group rounded-[20px] p-5 transition hover:-translate-y-0.5 hover:bg-white">
              <div className="flex items-center justify-between">
                <div className="vicos-orb h-10 w-10 rounded-xl text-slate-700"><Icon name="team" size={17} /></div>
                <Icon name="arrow" size={15} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />
              </div>
              <p className="mt-4 text-sm font-black text-slate-900">Convidar equipe</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Dê acesso ao VicOs com o nível certo.</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
