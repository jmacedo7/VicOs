"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createTask, updateTask, deleteTask } from "@/app/tasks/actions";
import { Icon } from "@/components/ui/icons";

type Task={id:string;title:string;description:string|null;status:string;priority:string;due_date:string|null;assignee_id:string|null;created_by:string;created_at:string;updated_at:string;completed_at:string|null};
type User={id:string;name:string;role:string|null};
type Props={initialData:{userId:string;role:string|null;tasks:Task[];users:User[]}};

export function TasksClient({initialData}:Props){
  const [tasks,setTasks]=useState<Task[]>(initialData.tasks);
  const [title,setTitle]=useState("");
  const [priority,setPriority]=useState("normal");
  const [assignee,setAssignee]=useState("");
  const [dueDate,setDueDate]=useState("");
  const [filter,setFilter]=useState("all");
  const [status,setStatus]=useState("");
  const canWrite=initialData.role!=="viewer";

  useEffect(()=>{
    const supabase=createClient();
    const channel=supabase.channel("vicos-tasks").on("postgres_changes",{event:"*",schema:"public",table:"tasks"},payload=>{
      const next=payload.new as Task; const old=payload.old as Task;
      if(payload.eventType==="INSERT")setTasks(cur=>cur.some(t=>t.id===next.id)?cur:[next,...cur]);
      if(payload.eventType==="UPDATE")setTasks(cur=>cur.map(t=>t.id===next.id?next:t));
      if(payload.eventType==="DELETE")setTasks(cur=>cur.filter(t=>t.id!==old.id));
    }).subscribe();
    return ()=>{void supabase.removeChannel(channel);};
  },[]);

  async function add(){
    if(!title.trim()||!canWrite)return;
    try{
      const created=await createTask({title,priority,dueDate:dueDate||undefined,assigneeId:assignee||null});
      setTasks(cur=>cur.some(t=>t.id===created.id)?cur:[created,...cur]);
      setTitle("");setDueDate("");setAssignee("");setStatus("Tarefa criada.");
    }catch(e){setStatus(e instanceof Error?e.message:"Não foi possível criar.");}
  }

  async function changeTask(id:string,next:string){
    try{
      const updated=await updateTask({id,status:next});
      setTasks(cur=>cur.map(t=>t.id===updated.id?updated:t));
    }catch(e){setStatus(e instanceof Error?e.message:"Não foi possível atualizar.");}
  }

  async function remove(id:string){
    try{await deleteTask(id);setTasks(cur=>cur.filter(t=>t.id!==id));}catch(e){setStatus(e instanceof Error?e.message:"Não foi possível remover.");}
  }

  const visible=useMemo(()=>filter==="all"?tasks:tasks.filter(t=>t.status===filter),[tasks,filter]);
  const counts={all:tasks.length,todo:tasks.filter(t=>t.status==="todo").length,in_progress:tasks.filter(t=>t.status==="in_progress").length,done:tasks.filter(t=>t.status==="done").length};

  return <section className="space-y-4">
    <div className="vicos-card rounded-[24px] p-5 md:p-6">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_150px_180px_150px_auto]">
        <input disabled={!canWrite} value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&void add()} className="vicos-input" placeholder="Ex.: Revisar proposta do cliente"/>
        <select disabled={!canWrite} value={priority} onChange={e=>setPriority(e.target.value)} className="vicos-input"><option value="low">Baixa</option><option value="normal">Normal</option><option value="high">Alta</option><option value="urgent">Urgente</option></select>
        <select disabled={!canWrite} value={assignee} onChange={e=>setAssignee(e.target.value)} className="vicos-input"><option value="">Responsável</option>{initialData.users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select>
        <input disabled={!canWrite} type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="vicos-input"/>
        <button disabled={!canWrite} onClick={()=>void add()} className="vicos-button disabled:opacity-50"><Icon name="plus" size={16}/>Adicionar</button>
      </div>
      {status&&<p className="mt-3 text-xs font-semibold text-slate-500">{status}</p>}
    </div>
    <div className="flex flex-wrap gap-2">{[["all","Todas"],["todo","A fazer"],["in_progress","Em andamento"],["done","Concluídas"]].map(([value,label])=><button key={value} onClick={()=>setFilter(value)} className={filter===value?"vicos-chip !bg-blue-50 !text-blue-700 !ring-1 !ring-blue-100":"vicos-chip"}>{label} <span>{counts[value as keyof typeof counts]}</span></button>)}</div>
    <div className="grid gap-3">{visible.map(task=>{
      const assigneeName=initialData.users.find(u=>u.id===task.assignee_id)?.name;
      return <article key={task.id} className="vicos-card rounded-[22px] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <button disabled={!canWrite} onClick={()=>void changeTask(task.id,task.status==="done"?"todo":"done")} className={task.status==="done"?"grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600":"grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-300 hover:text-blue-600"} aria-label="Concluir tarefa"><Icon name="check" size={16}/></button>
          <div className="min-w-0 flex-1"><h3 className={task.status==="done"?"truncate text-sm font-black text-slate-400 line-through":"truncate text-sm font-black text-slate-900"}>{task.title}</h3><div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400"><span>{assigneeName||"Sem responsável"}</span>{task.due_date&&<span>· até {new Date(task.due_date+"T12:00:00").toLocaleDateString("pt-BR")}</span>}<span className="vicos-chip !px-2 !py-1">{task.priority}</span></div></div>
          <select disabled={!canWrite} value={task.status} onChange={e=>void changeTask(task.id,e.target.value)} className="vicos-input !w-auto !min-w-[140px]"><option value="todo">A fazer</option><option value="in_progress">Em andamento</option><option value="done">Concluída</option><option value="cancelled">Cancelada</option></select>
          {canWrite&&<button onClick={()=>void remove(task.id)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-400 hover:text-rose-600">Remover</button>}
        </div>
      </article>
    })}{!visible.length&&<div className="vicos-card rounded-[24px] p-10 text-center text-sm text-slate-400">Nenhuma tarefa neste filtro.</div>}</div>
  </section>;
}
