"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserContext } from "@/lib/db/context";
import { optionalText, recordStatus, requiredText } from "@/lib/validations/core";

export async function createAccount(input:{platform:string;externalId:string;displayName?:string;username?:string;status?: "active"|"inactive"|"blocked"|"pending";notes?:string}){
  const {supabase,membership}=await getCurrentUserContext();
  const platform=requiredText(input.platform,"Platform",100);const externalId=requiredText(input.externalId,"External ID",200);const status=recordStatus(input.status??"active");
  const {data,error}=await supabase.from("accounts").insert({company_id:membership.company_id,platform,external_id:externalId,display_name:optionalText(input.displayName,200),username:optionalText(input.username,200),status,notes:optionalText(input.notes)}).select().single();
  if(error)throw new Error(error.code==="23505"?"ACCOUNT_ALREADY_EXISTS":error.message);revalidatePath("/accounts");revalidatePath("/dashboard");return data;
}
export async function updateAccount(id:string,input:{platform:string;externalId:string;displayName?:string;username?:string;status:"active"|"inactive"|"blocked"|"pending";notes?:string}){
  const {supabase}=await getCurrentUserContext();const status=recordStatus(input.status);
  const {data,error}=await supabase.from("accounts").update({platform:requiredText(input.platform,"Platform",100),external_id:requiredText(input.externalId,"External ID",200),display_name:optionalText(input.displayName,200),username:optionalText(input.username,200),status,notes:optionalText(input.notes)}).eq("id",id).select().single();
  if(error)throw new Error(error.message);revalidatePath("/accounts");return data;
}
export async function deleteAccount(id:string){
  const {supabase}=await getCurrentUserContext();const {error}=await supabase.from("accounts").delete().eq("id",id);
  if(error)throw new Error(error.message);revalidatePath("/accounts");revalidatePath("/dashboard");
}
