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

  const { data: task, error } = await supabase
    .from("tasks_tasks")
    .insert([{ ...data, created_by: user.id }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  await logActivity("task", task.id, "created");
  revalidatePath("/projects/[slug]/tasks", "page");
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks_tasks")
    .update({ status })
    .eq("id", taskId);

  if (error) throw new Error(error.message);
  await logActivity("task", taskId, "updated");
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
  await logActivity("task", taskId, "updated");
  revalidatePath("/projects/[slug]/tasks", "page");
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks_tasks")
    .update({ status: "cancelled" })
    .eq("id", taskId);

  if (error) throw new Error(error.message);
  await logActivity("task", taskId, "deleted");
  revalidatePath("/projects/[slug]/tasks", "page");
}