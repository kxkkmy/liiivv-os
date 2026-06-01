"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function logActivity(entityType: string, entityId: string, action: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("activity_logs").insert([{
    user_id: user.id,
    entity_type: entityType,
    entity_id: entityId,
    action,
  }]);
}

export async function createDocument(data: {
  title: string;
  doc_type: string;
  body?: string;
  tags?: string[];
  url?: string;
  project_id_new?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: doc, error } = await supabase
    .from("knowledge_documents")
    .insert([{ ...data, author_id: user.id }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  await logActivity("document", doc.id, "created");
  revalidatePath("/projects/[slug]/knowledge", "page");
}

export async function updateDocument(id: string, data: {
  title?: string;
  doc_type?: string;
  body?: string;
  tags?: string[];
  url?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("knowledge_documents")
    .update(data)
    .eq("id", id);

  if (error) throw new Error(error.message);
  await logActivity("document", id, "updated");
  revalidatePath("/projects/[slug]/knowledge", "page");
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("knowledge_documents")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  await logActivity("document", id, "deleted");
  revalidatePath("/projects/[slug]/knowledge", "page");
}