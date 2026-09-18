import Link from "next/link";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";

export default function SettingsPage(){
 const cards=[["Meu perfil","Foto, cargo, bio e status.","/profile"],["Empresa","Identidade, dados e personalização.","/company"],["Mensagens","Privacidade e comunicação entre membros.","/messages"],["Segurança","Sessões, autenticação e proteção da conta.","/settings/security"],["Notificações","Preferências de alertas e mensagens.","/settings/notifications"],["Pagamentos","Orientações para confirmar cobranças e pagamentos.","/payment-guidelines"]];
 return <div className="flex min-h-screen bg-transparent"><DashboardNav active="Configurações"/><main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9"><PageHeader eyebrow="Sistema" title="Configurações" description="Controle sua experiência, comunicação e segurança no VicOs."/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cards.map(([title,desc,href])=><Link key={href} href={href} className="vicos-card rounded-[22px] p-6"><p className="text-lg font-black">{title}</p><p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p><span className="mt-5 inline-flex text-xs font-bold text-blue-600">Abrir →</span></Link>)}</div></main></div>;
}