"use client";

import { useEffect, useState } from "react";

type Preferences={messages:boolean;activity:boolean};
const KEY="vicos:notification-preferences";
const defaults:Preferences={messages:true,activity:true};

export function NotificationPreferences(){
  const [preferences,setPreferences]=useState<Preferences>(defaults);
  useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw)setPreferences({...defaults,...JSON.parse(raw)});}catch{}},[]);
  function update(next:Preferences){setPreferences(next);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{}}
  return <section className="vicos-card mt-7 max-w-3xl rounded-[22px] p-6">
    <label className="flex items-center justify-between gap-6 text-sm font-semibold"><span>Mensagens privadas<span className="mt-1 block text-xs font-normal text-slate-400">Receber alertas quando alguém enviar uma mensagem.</span></span><input type="checkbox" checked={preferences.messages} onChange={e=>update({...preferences,messages:e.target.checked})}/></label>
    <label className="mt-6 flex items-center justify-between gap-6 text-sm font-semibold"><span>Atividade da empresa<span className="mt-1 block text-xs font-normal text-slate-400">Mostrar eventos importantes do seu workspace.</span></span><input type="checkbox" checked={preferences.activity} onChange={e=>update({...preferences,activity:e.target.checked})}/></label>
    <p className="mt-5 text-xs text-slate-400">As preferências são salvas neste dispositivo.</p>
  </section>;
}
