"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserContext } from "@/lib/db/context";
import { optionalText, requiredText } from "@/lib/validations/core";

export async function updateProfile(input:{name:string;jobTitle?:string;bio?:string;avatarUrl?:string;presence?:"online"|"away"|"busy"|"offline"}) {
  const {supabase,user}=await getCurrentUserContext();
  const {data,error}=await supabase.from("users").update({name:requiredText(input.name,"Name",120),job_title:optionalText(input.jobTitle,120),bio:optionalText(input.bio,500),avatar_url:optionalText(input.avatarUrl,1000),presence:input.presence??"online",last_seen_at:new Date().toISOString()}).eq("id",user.id).select().single();
  if(error) throw new Error(error.message);
  revalidatePath("/profile"); revalidatePath("/dashboard"); revalidatePath("/messages"); revalidatePath("/team");
  return data;
}