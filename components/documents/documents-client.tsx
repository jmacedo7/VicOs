"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createDocument, updateDocument, archiveDocument, getDocumentVersions } from "@/app/documents/actions";
import { Icon } from "@/components/ui/icons";
import { useLocalFirst } from "@/lib/local-first/use-local-first";

type Doc = { id:string; title:string; content:string; version:number; created_by:string; updated_by:string|null; created_at:string; updated_at:string; archived_at?:string|null };
type User = { id:string; name:string };
type Props = { initialData:{userId:string;role:string|null;documents:Doc[];users:User[]} };

export function DocumentsClient({ initialData }: Props) {
  const {data:documents,cacheUpsert,cacheRemove}=useLocalFirst<Doc>("documents",`documents:list:${initialData.userId}`,initialData.documents);
  const [selectedId,setSelectedId]=useState<string|null>(initialData.documents[0]?.id ?? null);
  const [title,setTitle]=useState(initialData.documents[0]?.title ?? "Novo documento");
  const [content,setContent]=useState(initialData.documents[0]?.content ?? "");
  const [version,setVersion]=useState(initialData.documents[0]?.version ?? 1);
  const [history,setHistory]=useState<any[]>([]);
  const [status,setStatus]=useState("");
  const [saving,setSaving]=useState(false);
  const lastSeenUpdatedAt=useRef<Record<string,string>>({});
  const canWrite=initialData.role!=="viewer";
  const selected=useMemo(()=>documents.find(d=>d.id===selectedId),[documents,selectedId]);

  useEffect(()=>{
    if(!selected)return;
    const previous=lastSeenUpdatedAt.current[selected.id];
    if(previous&&previous!==selected.updated_at&&selected.updated_by&&selected.updated_by!==initialData.userId){
      setStatus("Este documento foi atualizado por outro membro. Recarregue antes de editar.");
    }
    lastSeenUpdatedAt.current[selected.id]=selected.updated_at;
  },[initialData.userId,selected?.id,selected?.updated_at,selected?.updated_by,selected]);

  useEffect(()=>{
    const doc=selected;
    if(!doc)return;
    setTitle(doc.title); setContent(doc.content); setVersion(doc.version); setStatus("");
    void getDocumentVersions(doc.id).then(setHistory).catch(()=>setHistory([]));
  },[selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  function select(id:string){ setSelectedId(id); }

  async function newDocument(){
    if(!canWrite)return;
    try{
      const created=await createDocument({title:"Documento sem título"});
      await cacheUpsert(created);
      setSelectedId(created.id);
    }catch(e){setStatus(e instanceof Error?e.message:"Não foi possível criar o documento.");}
  }

  async function save(){
    if(!selectedId||!canWrite||saving)return;
    setSaving(true); setStatus("");
    try{
      const saved=await updateDocument({id:selectedId,title,content,expectedVersion:version});
      setVersion(saved.version);
      await cacheUpsert(saved);
      const nextHistory=await getDocumentVersions(saved.id);
      setHistory(nextHistory);
      setStatus("Salvo agora.");
    }catch(e){
      const message=e instanceof Error?e.message:"Não foi possível salvar.";
      if(message==="DOCUMENT_VERSION_CONFLICT") setStatus("O documento mudou em outro dispositivo. Recarregue para evitar sobrescrever a versão mais recente.");
      else setStatus(message);
    }finally{setSaving(false);}
  }

  async function archive(){
    if(!selectedId||initialData.role==="viewer")return;
    try{
      await archiveDocument(selectedId);
      await cacheRemove(selectedId);
      const nextId=documents.find(d=>d.id!==selectedId)?.id??null;
      setSelectedId(nextId);
      setStatus("Documento arquivado.");
    }catch(e){setStatus(e instanceof Error?e.message:"Não foi possível arquivar.");}
  }

  const currentVersion=history.find(item=>item.version===version);

  return (
    <section className="grid min-h-[calc(100vh-190px)] gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="vicos-card rounded-[24px] p-4">
        <div className="flex items-center justify-between px-1">
          <div><p className="text-[11px] font-bold uppercase tracking-[.17em] text-slate-400">Base</p><h2 className="mt-1 text-lg font-black">Documentos</h2></div>
          <button onClick={newDocument} disabled={!canWrite} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-blue-600 disabled:opacity-40" aria-label="Novo documento"><Icon name="plus" size={16}/></button>
        </div>
        <div className="mt-4 space-y-1.5">
          {documents.map(doc=><button key={doc.id} onClick={()=>select(doc.id)} className={"w-full rounded-2xl px-3 py-3 text-left transition "+(selectedId===doc.id?"bg-blue-50 text-blue-800 ring-1 ring-blue-100":"hover:bg-slate-50 text-slate-700")}>
            <p className="truncate text-sm font-bold">{doc.title}</p><p className="mt-1 text-[11px] text-slate-400">v{doc.version} · {new Date(doc.updated_at).toLocaleDateString("pt-BR")}</p>
          </button>)}
          {!documents.length&&<div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">Nenhum documento.</div>}
        </div>
      </aside>
      <div className="vicos-card min-w-0 rounded-[24px] p-5 md:p-7">
        {selectedId ? <>
          <div className="flex flex-col gap-3 border-b border-slate-200/70 pb-5 md:flex-row md:items-start">
            <div className="min-w-0 flex-1"><input disabled={!canWrite} value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-transparent text-2xl font-black tracking-tight outline-none placeholder:text-slate-300" /><p className="mt-1 text-xs text-slate-400">Versão {version} · alterações salvas na nuvem</p></div>
            <div className="flex items-center gap-2">
              {initialData.role!=="viewer"&&<button onClick={save} disabled={saving} className="vicos-button disabled:opacity-50"><Icon name="check" size={15}/>{saving?"Salvando…":"Salvar"}</button>}
              {(initialData.role==="admin"||initialData.role==="manager")&&<button onClick={archive} className="vicos-button-secondary">Arquivar</button>}
            </div>
          </div>
          <textarea disabled={!canWrite} value={content} onChange={e=>setContent(e.target.value)} className="mt-5 min-h-[420px] w-full resize-none bg-transparent text-[15px] leading-7 text-slate-700 outline-none placeholder:text-slate-300" placeholder="Comece a escrever…" />
          {status&&<div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">{status}</div>}
          <div className="mt-6 border-t border-slate-200/70 pt-5">
            <div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Histórico</p><h3 className="mt-1 font-black">Versões salvas</h3></div><span className="vicos-chip">{history.length} versões</span></div>
            <div className="mt-3 flex flex-wrap gap-2">
              {history.map(item=><button key={item.id} onClick={()=>{setTitle(item.title);setContent(item.content);setVersion(item.version);}} className={currentVersion?.id===item.id?"rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700":"rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"}>v{item.version}</button>)}
            </div>
          </div>
        </>:<div className="grid h-full min-h-[500px] place-items-center text-center"><div><div className="vicos-orb mx-auto"><Icon name="file" size={20}/></div><h2 className="mt-4 text-lg font-black">Selecione um documento</h2><p className="mt-1 text-sm text-slate-400">Ou crie o primeiro usando o botão +.</p></div></div>}
      </div>
    </section>
  );
}
