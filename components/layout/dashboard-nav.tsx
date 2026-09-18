import Link from "next/link";

const links = [
  ["Dashboard", "/dashboard"],
  ["Contatos", "/contacts"],
  ["Contas", "/accounts"],
  ["Financeiro", "/finance"],
  ["Equipe", "/team"],
  ["Sincronização", "/synchronization"],
  ["Histórico", "/history"],
  ["Empresa", "/company"],
  ["Configurações", "/settings"],
];

export function DashboardNav({ active }: { active?: string }) {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="border-b border-slate-100 px-6 py-6">
        <Link href="/dashboard" className="text-2xl font-black tracking-tight">
          <span className="text-blue-500">Vic</span>Os
        </Link>
        <p className="mt-1 text-xs font-medium text-slate-400">Your Business Operating System</p>
      </div>
      <nav className="space-y-1 p-4">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${active === label ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
