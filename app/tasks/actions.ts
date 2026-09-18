"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserContext } from "@/lib/db/context";
import { optionalText, requiredText } from "@/lib/validations/core";

const roles=["todo","in_progress","done","cancelled"] as const;
const priorities=["low","normal","high","urgent"] as const;

function validateStatus(value:string){if(!roles.includes(value as any))throw new Error("INVALID_STATUS");return value as typeof roles[number];}
function validatePriority(value:string){if(!priorities.includes(value as any))throw new Error("INVALID_PRIORITY");return value as typeof priorities[number];}

export async function createTask(input:{title:string;description?:string;priority?:string;dueDate?:string;assigneeId?:string|null}) {
  const {supabase,user,membership}=await getCurrentUserContext();
  if(membership.role==="viewer")throw new Error("FORBIDDEN");
  const assignee=input.assigneeId??null;
  if(assignee){
    const {data}=await supabase.from("users").select("id").eq("id",assignee).eq("company_id",membership.company_id).maybeSingle();
    if(!data)throw new Error("INVALID_ASSIGNEE");
  }
  const {data,error}=await supabase.from("tasks").insert({company_id:membership.company_id,created_by:user.id,assignee_id:assignee,title:requiredText(input.title,"Title",160),description:optionalText(input.description,1000),priority:validatePriority(input.priority??"normal"),due_date:input.dueDate||null,status:"todo"}).select().single();
  if(error)throw new Error(error.message);
  revalidatePath("/tasks");
  return data;
}

export async function updateTask(input:{id:string;status?:string;priority?:string;title?:string;description?:string;dueDate?:string|null;assigneeId?:string|null}) {
  const {supabase,membership}=await getCurrentUserContext();
  if(membership.role==="viewer")throw new Error("FORBIDDEN");
  const patch:any={};
  if(input.status!==undefined)patch.status=validateStatus(input.status);
  if(input.priority!==undefined)patch.priority=validatePriority(input.priority);
  if(input.title!==undefined)patch.title=requiredText(input.title,"Title",160);
  if(input.description!==undefined)patch.description=optionalText(input.description,1000);
  if(input.dueDate!==undefined)patch.due_date=input.dueDate||null;
  if(input.assigneeId!==undefined){
    if(input.assigneeId){
      const {data}=await supabase.from("users").select("id").eq("id",input.assigneeId).eq("company_id",membership.company_id).maybeSingle();
      if(!data)throw new Error("INVALID_ASSIGNEE");
    }
    patch.assignee_id=input.assigneeId||null;
  }
  if(patch.status==="done")patch.completed_at=new Date().toISOString();
  if(patch.status&&patch.status!=="done")patch.completed_at=null;
  const {data,error}=await supabase.from("tasks").update(patch).eq("id",input.id).eq("company_id",membership.company_id).select().single();
  if(error)throw new Error(error.message);
  revalidatePath("/tasks");
  return data;
}

export async function deleteTask(id:string){
  const {supabase}=await getCurrentUserContext();
  const {error}=await supabase.from("tasks").delete().eq("id",id);
  if(error)throw new Error(error.message);
  revalidatePath("/tasks");
}
