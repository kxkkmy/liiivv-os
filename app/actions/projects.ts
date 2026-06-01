"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: {
  name: string;
  slug: string;
  description: string;
  icon: string;
  join_password: string;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: self } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!["owner", "admin"].includes(self?.role ?? "")) {
    throw new Error("権限がありません");
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert([{
      ...formData,
      join_code: formData.slug,
      status: "active",
      created_by: user.id,
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // 作成者をownerとして追加
  await supabase.from("project_members").insert([{
    project_id: project.id,
    profile_id: user.id,
    role: "owner",
  }]);

  revalidatePath("/management/projects");
  redirect("/management/projects");
}

export async function updateProjectPassword(projectId: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .update({ join_password: password })
    .eq("id", projectId);

  if (error) throw new Error(error.message);
  revalidatePath("/management/projects");
}

export async function archiveProject(projectId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .update({ status: "archived" })
    .eq("id", projectId);

  if (error) throw new Error(error.message);
  revalidatePath("/management/projects");
}

export async function addActivityLog(entityType: string, entityId: string, action: string, diff?: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("activity_logs").insert([{
    user_id: user.id,
    entity_type: entityType,
    entity_id: entityId,
    action,
    diff,
  }]);
}