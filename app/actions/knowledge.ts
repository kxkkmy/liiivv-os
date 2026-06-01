"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

  const { error } = await supabase
    .from("knowledge_documents")
    .insert([{ ...data, author_id: user.id }]);

  if (error) throw new Error(error.message);
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
  revalidatePath("/projects/[slug]/knowledge", "page");
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("knowledge_documents")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/knowledge", "page");
}