import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icons";

type NavItem = [IconName, string, string];

const links: NavItem[] = [
  ["grid", "Dashboard", "/dashboard"],
  ["users", "Contatos", "/contacts"],
  ["wallet", "Contas", "/accounts"],
  ["chart", "Financeiro", "/finance"],
  ["team", "Equipe", "/team"],
  ["sync", "Sincronização", "/synchronization"],
  ["history", "Histórico", "/history"],
];

const secondary: NavItem[] = [
  ["building", "Empresa", "/company"],
  ["settings", "Configurações", "/settings"],
];

function NavLink({ item, active }: { item: NavItem; active?: string }) {
  const [icon, label, href] = item;
  const selected = active === label;

  return (
    <Link
      href={href}
      className={[
        "group flex items-center gap-3 rounded-[13px] px-3 py-2.5 text-sm font-semibold transition-all duration-200",
        selected
          ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100/80"
          : "text-slate-600 hover:bg-white/80 hover:text-slate-950",
      ].join(" ")}
    >
      <span
        className={[
          "grid h-8 w-8 shrink-0 place-items-center rounded-[10px] transition-all duration-200",
          selected
            ? "bg-white text-blue-600 shadow-sm"
            : "bg-slate-100/70 text-slate-500 group-hover:bg-white group-hover:text-slate-700",
        ].join(" ")}
      >
        <Icon name={icon} size={16} />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function DashboardNav({ active }: { active?: string }) {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 border-r border-slate-200/70 bg-white/62 lg:block lg:backdrop-blur-xl">
        <div className="px-5 pb-6 pt-7">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="vicos-orb h-10 w-10 rounded-xl">
              <span className="text-sm font-black text-blue-600">V</span>
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-slate-950">
                <span className="text-blue-600">Vic</span>Os
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">
                Business OS
              </div>
            </div>
          </Link>
        </div>

        <nav className="px-3">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
            Workspace
          </p>
          <div className="space-y-1">
            {links.map((item) => (
              <NavLink key={item[2]} item={item} active={active} />
            ))}
          </div>

          <div className="my-5 h-px bg-slate-200/80" />

          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
            Organização
          </p>
          <div className="space-y-1">
            {secondary.map((item) => (
              <NavLink key={item[2]} item={item} active={active} />
            ))}
          </div>
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-white/80 bg-white/65 p-3 shadow-[0_10px_26px_rgba(15,23,42,.06)] backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
              JM
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-900">João Macedo</p>
              <p className="text-[11px] text-slate-500">Administrador</p>
            </div>
            <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.08)]" />
          </div>
        </div>
      </aside>

      <div className="fixed inset-x-0 top-0 z-40 flex h-[62px] items-center justify-between border-b border-slate-200/70 bg-white/72 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="vicos-orb h-9 w-9 rounded-xl">
            <span className="text-xs font-black text-blue-600">V</span>
          </div>
          <span className="text-lg font-black tracking-tight">
            <span className="text-blue-600">Vic</span>Os
          </span>
        </Link>
        <Link
          href="/settings"
          aria-label="Configurações"
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200/70 bg-white/75 text-slate-500"
        >
          <Icon name="settings" size={17} />
        </Link>
      </div>
    </>
  );
}
