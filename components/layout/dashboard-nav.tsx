import Link from "next/link";

const links = [
  ["◈", "Dashboard", "/dashboard"], ["◉", "Contatos", "/contacts"], ["▣", "Contas", "/accounts"],
  ["$", "Financeiro", "/finance"], ["◎", "Equipe", "/team"], ["↻", "Sincronização", "/synchronization"],
  ["◷", "Histórico", "/history"],
];
const secondary = [["⌂", "Empresa", "/company"], ["⚙", "Configurações", "/settings"]];

export function DashboardNav({ active }: { active?: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 border-r border-slate-200/70 bg-white/65 lg:block lg:backdrop-blur-xl">
      <div className="px-5 pb-5 pt-7">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="vicos-orb h-10 w-10 rounded-xl"><span className="text-sm font-black text-blue-600">V</span></div>
          <div><div className="text-xl font-black tracking-tight text-slate-950"><span className="text-blue-600">Vic</span>Os</div><div className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">Business OS</div></div>
        </Link>
      </div>
      <nav className="px-3 py-2">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Workspace</p>
        <div className="space-y-1">
          {links.map(([icon,label,href]) => <Link key={href} href={href} className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${active===label ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100" : "text-slate-600 hover:bg-white hover:text-slate-950"}`}><span className={`grid h-7 w-7 place-items-center rounded-lg text-xs ${active===label ? "bg-white text-blue-600 shadow-sm" : "bg-slate-100/70 text-slate-500"}`}>{icon}</span>{label}</Link>)}
        </div>
        <div className="my-5 h-px bg-slate-200/70" />
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Workspace</p>
        <div className="space-y-1">
          {secondary.map(([icon,label,href]) => <Link key={href} href={href} className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${active===label ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-white hover:text-slate-950"}`}><span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100/70 text-xs text-slate-500">{icon}</span>{label}</Link>)}
        </div>
      </nav>
      <div className="absolute bottom-5 left-4 right-4 vicos-glass rounded-2xl p-3"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">JM</div><div><p className="text-xs font-bold text-slate-900">João Macedo</p><p className="text-[11px] text-slate-500">Administrador</p></div></div></div>
    </aside>
  );
}