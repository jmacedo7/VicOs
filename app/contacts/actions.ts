"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserContext } from "@/lib/db/context";
import { normalizePhone, optionalText, recordStatus, requiredText } from "@/lib/validations/core";

export async function createContact(input:{name:string;phone:string;status?: "active"|"inactive"|"blocked"|"pending";notes?:string}){
  const {supabase,membership}=await getCurrentUserContext();
  const name=requiredText(input.name,"Name",200);
  const phone=requiredText(input.phone,"Phone",40);
  const normalizedPhone=normalizePhone(phone);
  const status=recordStatus(input.status??"active");
  const {data,error}=await supabase.from("contacts").insert({company_id:membership.company_id,name,phone,normalized_phone:normalizedPhone,status,notes:optionalText(input.notes),country_code:"+55",area_code:normalizedPhone.length>=10?normalizedPhone.slice(-11).slice(0,2):null}).select().single();
  if(error)throw new Error(error.code==="23505"?"CONTACT_ALREADY_EXISTS":error.message);
  revalidatePath("/contacts");revalidatePath("/dashboard");return data;
}
export async function updateContact(id:string,input:{name:string;phone:string;status:"active"|"inactive"|"blocked"|"pending";notes?:string}){
  const {supabase}=await getCurrentUserContext();
  const name=requiredText(input.name,"Name",200);const phone=requiredText(input.phone,"Phone",40);const status=recordStatus(input.status);
  const {data,error}=await supabase.from("contacts").update({name,phone,normalized_phone:normalizePhone(phone),status,notes:optionalText(input.notes)}).eq("id",id).select().single();
  if(error)throw new Error(error.message);revalidatePath("/contacts");return data;
}
export async function deleteContact(id:string){
  const {supabase}=await getCurrentUserContext();const {error}=await supabase.from("contacts").delete().eq("id",id);
  if(error)throw new Error(error.message);revalidatePath("/contacts");revalidatePath("/dashboard");
}
