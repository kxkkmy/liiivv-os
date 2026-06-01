"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTask(data: {
  title: string;
  description?: string;
  priority: string;
  status: string;
  due_date?: string;
  project_id_new?: string;
  assignee_id?: string;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("tasks_tasks")
    .insert([{ ...data, created_by: user.id }]);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/tasks", "page");
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks_tasks")
    .update({ status })
    .eq("id", taskId);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/tasks", "page");
}

export async function updateTask(taskId: string, data: {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date?: string;
  assignee_id?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks_tasks")
    .update(data)
    .eq("id", taskId);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/tasks", "page");
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks_tasks")
    .update({ status: "cancelled" })
    .eq("id", taskId);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/tasks", "page");
}