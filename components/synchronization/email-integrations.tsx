"use client";

import { useTransition } from "react";
import { disconnectEmailIntegration } from "@/app/synchronization/email-actions";

type Integration={id:string;provider:string;email:string;status:string;updated_at:string};
export function EmailIntegrations({integrations,googleConfigured,microsoftConfigured}:{integrations:Integration[];googleConfigured:boolean;microsoftConfigured:boolean}){
  const [pending,startTransition]=useTransition();
  return <section className="vicos-card rounded-[24px] p-6 md:p-7">
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div><p className="text-[11px] font-bold uppercase tracking-[.17em] text-slate-400">E-mail</p><h2 className="mt-1 text-xl font-black">Contas conectadas</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Conecte Gmail ou Outlook para preparar a central de e-mail do VicOs. Os tokens ficam cifrados no servidor e nunca são enviados ao navegador.</p></div>
      <span className="vicos-chip">{integrations.length} conexão{integrations.length===1?"":"ões"}</span>
    </div>
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      <a href={googleConfigured?"/api/integrations/google/start":"#"} aria-disabled={!googleConfigured} onClick={e=>{if(!googleConfigured)e.preventDefault();}} className={googleConfigured?"vicos-button":"vicos-button-secondary pointer-events-none opacity-45"}>Google / Gmail <span>→</span></a>
      <a href={microsoftConfigured?"/api/integrations/microsoft/start":"#"} aria-disabled={!microsoftConfigured} onClick={e=>{if(!microsoftConfigured)e.preventDefault();}} className={microsoftConfigured?"vicos-button-secondary":"vicos-button-secondary pointer-events-none opacity-45"}>Microsoft / Outlook <span>→</span></a>
    </div>
    <div className="mt-4 space-y-2">
      {integrations.map(item=><div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 sm:flex-row sm:items-center">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-sm font-black text-slate-700">{item.provider==="google"?"G":"M"}</div>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-slate-900">{item.email}</p><p className="mt-1 text-xs text-slate-400">{item.provider==="google"?"Google / Gmail":"Microsoft / Outlook"} · {item.status==="connected"?"Conectado":"Atenção"}</p></div>
        <button disabled={pending} onClick={()=>startTransition(()=>{void disconnectEmailIntegration(item.id)})} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600">{pending?"…":"Desconectar"}</button>
      </div>)}
      {!integrations.length&&<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-400">Nenhuma conta de e-mail conectada ainda.</div>}
    </div>
    {(!googleConfigured||!microsoftConfigured)&&<p className="mt-4 text-xs leading-5 text-amber-700">Os provedores ficam disponíveis após configurar as credenciais OAuth no ambiente de produção.</p>}
  </section>;
}
