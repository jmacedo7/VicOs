import Link from "next/link";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { NotificationPreferences } from "@/components/settings/notification-preferences";

export default function NotificationsSettingsPage(){return <div className="flex min-h-screen bg-transparent"><DashboardNav active="Configurações"/><main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9"><Link href="/settings" className="text-xs font-bold text-blue-600">← Configurações</Link><p className="mt-5 text-[11px] font-bold uppercase tracking-[.22em] text-blue-600">Preferências</p><h1 className="mt-2 text-3xl font-black">Notificações</h1><NotificationPreferences/></main></div>}
