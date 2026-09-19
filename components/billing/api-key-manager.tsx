"use client";

import { useState, useTransition } from "react";
import { createApiKey, revokeApiKey } from "@/app/billing/actions";

const scopes=["contacts:read","contacts:write","accounts:read","accounts:write","tasks:read","tasks:write","documents:read","documents:write","finance:read","finance:write","messages:read","messages:write"];

export function ApiKeyManager({keys}:{keys:Array<{id:string;name:string;prefix:string;scopes:string[];expires_at:string|null;last_used_at:string|null;revoked_at:string|null}>}) {
  const [pending,startTransition]=useTransition();
  const [name,setName]=useState("");
  const [selected,setSelected]=useState<string[]>(["contacts:read"]);
  const [newKey,setNewKey]=useState<string|null>(null);
  const toggle=(scope:string)=>setSelected(v=>v.includes(scope)?v.filter(x=>x!==scope):[...v,scope]);
  const create=()=>startTransition(async()=>{try{const result=await createApiKey(name,selected);setNewKey(result.key);setName("");}catch(e){alert(e instanceof Error?e.message:"Não foi possível criar a chave.");}});
  return <section className="vicos-card rounded-[24px] p-6 md:p-7">
    <p className="text-[11px] font-bold uppercase tracking-[.17em] text-slate-400">Developer</p><h2 className="mt-1 text-xl font-black">API Keys</h2><p className="mt-2 text-sm text-slate-500">A chave completa aparece uma única vez e o banco guarda somente o hash.</p>
    <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome da integração" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"/><button disabled={pending||!name.trim()||!selected.length} onClick={create} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{pending?"Criando…":"Criar chave"}</button></div>
    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{scopes.map(scope=><label key={scope} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"><input type="checkbox" checked={selected.includes(scope)} onChange={()=>toggle(scope)}/>{scope}</label>)}</div>
    {newKey&&<div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-bold text-emerald-700">Copie agora. Ela não será exibida novamente.</p><code className="mt-2 block break-all rounded-xl bg-white p-3 text-xs text-slate-800">{newKey}</code></div>}
    <div className="mt-6 space-y-2">{keys.map(k=><div key={k.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center"><div className="min-w-0 flex-1"><p className="text-sm font-bold">{k.name}</p><p className="mt-1 font-mono text-xs text-slate-400">{k.prefix}••••••••</p><p className="mt-1 text-xs text-slate-400">{k.revoked_at?"Revogada":k.last_used_at?"Último uso "+new Date(k.last_used_at).toLocaleString("pt-BR"):"Nunca usada"}</p></div>{!k.revoked_at&&<button disabled={pending} onClick={()=>startTransition(()=>revokeApiKey(k.id))} className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600">Revogar</button>}</div>)}</div>
  </section>;
}
