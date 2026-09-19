"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserContext } from "@/lib/db/context";
import { optionalText, requiredText } from "@/lib/validations/core";

function canWrite(role: string | null) {
  return role !== "viewer";
}

export async function createDocument(input: { title: string; content?: string }) {
  const { supabase, user, membership } = await getCurrentUserContext();
  if (!canWrite(membership.role)) throw new Error("FORBIDDEN");
  const { data, error } = await supabase.from("documents").insert({
    company_id: membership.company_id,
    created_by: user.id,
    updated_by: user.id,
    title: requiredText(input.title, "Title", 160),
    content: optionalText(input.content, 10000) ?? "",
  }).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/documents");
  return data;
}

export async function updateDocument(input: { id: string; title: string; content: string; expectedVersion: number }) {
  const { supabase, user, membership } = await getCurrentUserContext();
  if (!canWrite(membership.role)) throw new Error("FORBIDDEN");
  if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 1) throw new Error("INVALID_VERSION");

  const current = await supabase.from("documents").select("version").eq("id", input.id).eq("company_id", membership.company_id).is("archived_at", null).single();
  if (current.error || !current.data) throw new Error("DOCUMENT_NOT_FOUND");
  if (current.data.version !== input.expectedVersion) throw new Error("DOCUMENT_VERSION_CONFLICT");

  const { data, error } = await supabase.from("documents").update({
    title: requiredText(input.title, "Title", 160),
    content: requiredText(input.content, "Content", 10000),
    updated_by: user.id,
  }).eq("id", input.id).eq("company_id", membership.company_id).eq("version", input.expectedVersion).select().single();

  if (error) throw new Error(error.message);
  revalidatePath("/documents");
  return data;
}

export async function archiveDocument(id: string) {
  const { supabase, membership } = await getCurrentUserContext();
  if (membership.role !== "admin" && membership.role !== "manager") throw new Error("FORBIDDEN");
  const { error } = await supabase.from("documents").update({ archived_at: new Date().toISOString() }).eq("id", id).eq("company_id", membership.company_id);
  if (error) throw new Error(error.message);
  revalidatePath("/documents");
}

export async function getDocumentVersions(id: string) {
  const { supabase, membership } = await getCurrentUserContext();
  const { data: document, error: documentError } = await supabase.from("documents").select("id").eq("id", id).eq("company_id", membership.company_id).maybeSingle();
  if (documentError || !document) throw new Error("DOCUMENT_NOT_FOUND");

  const { data, error } = await supabase.from("document_versions").select("id,version,title,content,edited_by,created_at").eq("document_id", id).order("version", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
