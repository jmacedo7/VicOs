"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/icons";
import { createDirectConversation, markConversationRead, setPresence } from "@/app/messages/actions";
import { decryptMessage, encryptMessage, ensureDeviceKey, createConversationKey, unwrapConversationKey, wrapConversationKey } from "@/lib/crypto/chat";

type User = { id:string; name:string; email:string; avatar_url:string|null; job_title:string|null; presence:string|null; last_seen_at:string|null };
type Data = { userId:string; role:string; chatEnabled:boolean; chatAllowAttachments:boolean; members:{conversation_id:string;user_id:string;last_read_at:string|null}[]; users:User[]; conversations:{id:string;created_at:string;last_message_at:string|null}[] };

function avatar(user: User | undefined) {
  if (user?.avatar_url) return <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />;
  return <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{(user?.name ?? "?").slice(0,2).toUpperCase()}</div>;
}

export function MessagesClient({ initialData }: { initialData: Data }) {
  const supabase = useMemo(() => createClient(), []);
  const [data, setData] = useState(initialData);
  const [selected, setSelected] = useState<string | null>(initialData.conversations[0]?.id ?? null);
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [security, setSecurity] = useState("Preparando criptografia…");
  const keyRef = useRef<CryptoKey | null>(null);
  const deviceRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const otherUsers = data.users.filter((u) => u.id !== data.userId);
  const conversationOther = (conversationId: string | null) => {
    const ids = data.members.filter((m) => m.conversation_id === conversationId).map((m) => m.user_id);
    return data.users.find((u) => ids.includes(u.id) && u.id !== data.userId);
  };
  const selectedUser = conversationOther(selected);

  useEffect(() => {
    ensureDeviceKey(data.userId, supabase).then((device) => { deviceRef.current = device; setSecurity("Criptografia ponta a ponta ativa"); }).catch(() => setSecurity("Não foi possível preparar a chave deste dispositivo."));
    setPresence("online").catch(() => undefined);
    const timer = setInterval(() => setPresence("online").catch(() => undefined), 60000);
    return () => { clearInterval(timer); setPresence("offline").catch(() => undefined); };
  }, [data.userId, supabase]);

  async function provisionInitialConversation(conversationId: string, recipient: User) {
    if (!deviceRef.current) return undefined;

    const { data: conversation } = await supabase
      .from("conversations")
      .select("created_by")
      .eq("id", conversationId)
      .single();

    const { data: envelopes } = await supabase
      .from("conversation_key_envelopes")
      .select("device_key_id")
      .eq("conversation_id", conversationId)
      .limit(1);

    if (envelopes?.length) {
      throw new Error("A chave desta conversa foi criada em outro dispositivo. Abra o VicOs no dispositivo que iniciou a conversa para disponibilizá-la aqui.");
    }

    if (conversation?.created_by !== data.userId) {
      throw new Error("A conversa ainda não foi inicializada pelo dispositivo que a criou.");
    }

    const { data: keys } = await supabase
      .from("device_keys")
      .select("id,user_id,public_key")
      .in("user_id", [data.userId, recipient.id]);

    if (!keys?.length) throw new Error("Chaves do dispositivo ainda não estão disponíveis.");

    const senderKey = keys.find((k) => k.id === deviceRef.current.id);
    const recipientKeys = keys.filter((k) => k.user_id === recipient.id);
    if (!senderKey) throw new Error("A chave deste dispositivo ainda não está disponível.");

    const conversationKey = await createConversationKey();

    for (const target of [senderKey, ...recipientKeys]) {
      const wrapped = await wrapConversationKey(
        conversationKey,
        deviceRef.current.privateKey,
        JSON.parse(target.public_key),
      );
      const { error } = await supabase.from("conversation_key_envelopes").upsert({
        conversation_id: conversationId,
        device_key_id: target.id,
        sender_device_key_id: deviceRef.current.id,
        encrypted_key: wrapped.encryptedKey,
        iv: wrapped.iv,
      });
      if (error) throw error;
    }

    keyRef.current = conversationKey;
    await storeConversationKey(conversationId, conversationKey);
    return conversationKey;
  }

  async function storeConversationKey(id: string, key: CryptoKey) {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open("vicos-secure-keys", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("keys");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    await new Promise<void>((resolve,reject) => { const tx=db.transaction("keys","readwrite"); tx.objectStore("keys").put(key, `conversation:${id}`); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error); });
  }

  async function getStoredConversationKey(id: string) {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open("vicos-secure-keys", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("keys");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return new Promise<CryptoKey | undefined>((resolve,reject) => { const tx=db.transaction("keys","readonly"); const req=tx.objectStore("keys").get(`conversation:${id}`); req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error); });
  }

  async function provisionMissingEnvelopes(conversationId: string, conversationKey: CryptoKey, recipientUserIds: string[]) {
    if (!deviceRef.current) return;
    const { data: keys } = await supabase.from("device_keys").select("id,user_id,public_key").in("user_id", recipientUserIds);
    const { data: existing } = await supabase.from("conversation_key_envelopes").select("device_key_id").eq("conversation_id", conversationId);
    const known = new Set((existing ?? []).map((row) => row.device_key_id));
    const targets = (keys ?? []).filter((key) => !known.has(key.id));
    for (const target of targets) {
      const wrapped = await wrapConversationKey(conversationKey, deviceRef.current.privateKey, JSON.parse(target.public_key));
      await supabase.from("conversation_key_envelopes").upsert({
        conversation_id: conversationId,
        device_key_id: target.id,
        sender_device_key_id: deviceRef.current.id,
        encrypted_key: wrapped.encryptedKey,
        iv: wrapped.iv,
      });
    }
  }

  async function loadConversation(id: string) {
    setSelected(id); setLoading(true); setMessages([]);
    keyRef.current = null;
    try {
      let key = await getStoredConversationKey(id);
      const { data: envelope } = await supabase.from("conversation_key_envelopes").select("encrypted_key,iv,sender_device_key_id").eq("conversation_id",id).eq("device_key_id",deviceRef.current?.id ?? "").maybeSingle();
      if (!key && envelope && deviceRef.current) {
        const { data: sender } = await supabase.from("device_keys").select("public_key").eq("id",envelope.sender_device_key_id).single();
        if (sender) key = await unwrapConversationKey({encryptedKey:envelope.encrypted_key,iv:envelope.iv},deviceRef.current.privateKey,JSON.parse(sender.public_key));
        if (key) await storeConversationKey(id,key);
      }
      const recipient = conversationOther(id);
      if (!key && recipient) {
        key = await provisionInitialConversation(id, recipient);
      }
      if (!key) throw new Error("Esta conversa ainda não possui uma chave disponível neste dispositivo.");

      keyRef.current = key;

      const memberUserIds = data.members
        .filter((member) => member.conversation_id === id && member.user_id !== data.userId)
        .map((member) => member.user_id);

      await provisionMissingEnvelopes(id, key, memberUserIds);
      const { data: rows, error } = await supabase.from("messages").select("id,sender_id,ciphertext,iv,created_at,deleted_at").eq("conversation_id",id).order("created_at");
      if (error) throw error;
      const decrypted = await Promise.all((rows ?? []).map(async (row) => ({...row,text:row.deleted_at ? "Mensagem apagada" : await decryptMessage(key!,row.ciphertext,row.iv)})));
      setMessages(decrypted);
      await markConversationRead(id);
    } catch (error) {
      setSecurity(error instanceof Error ? error.message : "Erro de segurança");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (!selected) return;
    loadConversation(selected);
    const channel = supabase.channel(`chat:${selected}`).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:`conversation_id=eq.${selected}`},async(payload) => {
      const row:any=payload.new;
      if (row.sender_id===data.userId) return;
      const key=keyRef.current;
      if (!key) return;
      try { const text=await decryptMessage(key,row.ciphertext,row.iv); setMessages((current)=>[...current,{...row,text}]); } catch {}
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages.length]);

  async function startConversation(userId:string) {
    setLoading(true);
    try {
      const id=await createDirectConversation(userId);
      const {data:members}=await supabase.from("conversation_members").select("conversation_id,user_id,last_read_at").eq("conversation_id",id);
      const {data:conversations}=await supabase.from("conversations").select("id,created_at,last_message_at").eq("id",id);
      setData((d)=>({...d,members:members??d.members,conversations:[...(d.conversations.filter(c=>c.id!==id)),...(conversations??[])]}));
      setSelected(id as string);
    } finally { setLoading(false); }
  }

  async function sendMessage() {
    const text=draft.trim();
    if (!text || !selected || !keyRef.current) return;
    setDraft("");
    const encrypted=await encryptMessage(keyRef.current,text);
    const {data:row,error}=await supabase.from("messages").insert({conversation_id:selected,sender_id:data.userId,ciphertext:encrypted.ciphertext,iv:encrypted.iv}).select("id,sender_id,ciphertext,iv,created_at").single();
    if (error) { setDraft(text); return; }
    setMessages((m)=>[...m,{...row,text}]);
  }

  return (
    <div className="grid min-h-[650px] overflow-hidden rounded-[26px] border border-white/80 bg-white/65 shadow-[0_18px_60px_rgba(15,23,42,.07)] backdrop-blur-xl lg:grid-cols-[300px_1fr]">
      <aside className="border-b border-slate-200/70 bg-white/45 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between p-4">
          <div><p className="text-sm font-black text-slate-950">Conversas</p><p className="text-[11px] text-slate-400">Privadas e criptografadas</p></div>
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon name="plus" size={16}/></span>
        </div>
        <div className="space-y-1 px-3 pb-3">
          {data.conversations.map((c) => { const u=conversationOther(c.id); return <button key={c.id} onClick={()=>loadConversation(c.id)} className={selected===c.id?"flex w-full items-center gap-3 rounded-2xl bg-blue-50 p-3 text-left":"flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-white/80"}>{avatar(u)}<span className="min-w-0"><strong className="block truncate text-xs text-slate-900">{u?.name??"Conversa"}</strong><span className="text-[10px] text-slate-400">{u?.presence==="online"?"Online":"Offline"}</span></span></button>; })}
        </div>
        <div className="border-t border-slate-200/70 p-4"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Novo chat</p>{otherUsers.filter(u=>!data.conversations.some(c=>conversationOther(c.id)?.id===u.id)).slice(0,8).map(u=><button key={u.id} onClick={()=>startConversation(u.id)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/80">{avatar(u)}<span className="truncate text-xs font-semibold">{u.name}</span></button>)}</div>
      </aside>
      <section className="flex min-h-[620px] flex-col bg-white/35">
        {selectedUser ? <><header className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4"><div className="flex items-center gap-3">{avatar(selectedUser)}<div><p className="text-sm font-black">{selectedUser.name}</p><p className="text-[11px] text-slate-400">{selectedUser.job_title??"Membro da equipe"} · {selectedUser.presence==="online"?"Online":"Offline"}</p></div></div><span className="vicos-chip"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>{security}</span></header><div className="flex-1 space-y-3 overflow-y-auto p-5">{loading&&<div className="py-12 text-center text-xs text-slate-400">Abrindo conversa segura…</div>}{messages.map((m)=><div key={m.id} className={m.sender_id===data.userId?"flex justify-end":"flex justify-start"}><div className={m.sender_id===data.userId?"max-w-[78%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-2.5 text-sm text-white shadow-sm":"max-w-[78%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200/70"}><p>{m.text}</p><span className={m.sender_id===data.userId?"mt-1 block text-[9px] text-blue-100":"mt-1 block text-[9px] text-slate-400"}>{new Date(m.created_at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</span></div></div>)}<div ref={bottomRef}/></div><form onSubmit={(e)=>{e.preventDefault();sendMessage()}} className="border-t border-slate-200/70 p-4"><div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"><textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={1} placeholder="Escreva uma mensagem…" className="min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none"/><button className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white" aria-label="Enviar"><Icon name="arrow" size={17}/></button></div><p className="mt-2 text-center text-[10px] text-slate-400">🔐 O conteúdo é cifrado no dispositivo antes do envio.</p></form></> : <div className="flex flex-1 items-center justify-center p-10 text-center"><div><div className="vicos-orb mx-auto text-blue-600"><Icon name="users" size={20}/></div><h2 className="mt-4 text-lg font-black">Escolha uma conversa</h2><p className="mt-1 text-sm text-slate-500">Inicie um chat privado com qualquer membro da empresa.</p></div></div>}
      </section>
    </div>
  );
}
