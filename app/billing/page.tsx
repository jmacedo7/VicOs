import { DashboardNav } from "@/components/layout/dashboard-nav";
import { PageHeader } from "@/components/layout/page-header";
import { getBillingContext } from "@/lib/billing/entitlements";
import { ApiKeyManager } from "@/components/billing/api-key-manager";

export default async function BillingPage() {
  const { supabase, membership, subscription, plan } = await getBillingContext();
  const { data: keys } = await supabase.from("api_keys").select("id,name,prefix,scopes,expires_at,last_used_at,revoked_at").eq("company_id",membership.company_id).order("created_at",{ascending:false});
  const isPro = plan?.code === "pro" && ["active","trialing"].includes(subscription?.status ?? "");
  return <div className="flex min-h-screen"><DashboardNav active="Configurações"/><main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9"><PageHeader eyebrow="Conta e plano" title="Plano e integrações" description="Gerencie o plano da empresa, recursos liberados e chaves de integração."/>
    <div className="grid gap-4 md:grid-cols-2">
      <section className="vicos-card rounded-[24px] p-6"><p className="text-[11px] font-bold uppercase tracking-[.17em] text-slate-400">Plano atual</p><div className="mt-2 flex items-end justify-between"><h2 className="text-3xl font-black">{plan?.name ?? "Free"}</h2><span className="text-lg font-black text-blue-600">{plan?.price_cents===0?"Grátis":"R$ "+((plan?.price_cents??0)/100).toFixed(2).replace(".",",")}/mês</span></div><p className="mt-2 text-sm text-slate-500">{plan?.description}</p><div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm"><p><b>Email:</b> {isPro?"Liberado":"Disponível no Pro"}</p><p className="mt-2"><b>Excel:</b> {isPro?"Liberado":"Disponível no Pro"}</p><p className="mt-2"><b>API Keys:</b> {isPro?"Liberado":"Disponível no Pro"}</p></div>{!isPro&&<div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4"><p className="text-sm font-bold text-blue-800">Pro — R$ 49,90/mês</p><p className="mt-1 text-xs leading-5 text-blue-700">Integrações de e-mail e Excel, API Keys e automações avançadas.</p><button disabled className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white opacity-60">Pagamento será configurado</button></div>}</section>
      <section className="vicos-card rounded-[24px] p-6"><p className="text-[11px] font-bold uppercase tracking-[.17em] text-slate-400">Pro</p><h2 className="mt-2 text-2xl font-black">Tudo em um só lugar.</h2><ul className="mt-4 space-y-2 text-sm text-slate-600"><li>✓ E-mail Google/Microsoft</li><li>✓ Excel e integrações de dados</li><li>✓ API Keys com scopes</li><li>✓ 50.000 requests de API/mês</li><li>✓ Até 10 usuários</li><li>✓ Até 10.000 contatos</li></ul></section>
    </div>
    {isPro&&<div className="mt-4"><ApiKeyManager keys={keys??[]}/></div>}
  </main></div>;
}
