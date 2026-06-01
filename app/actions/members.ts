"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateMemberRole(profileId: string, role: string) {
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

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", profileId);

  if (error) throw new Error(error.message);
  revalidatePath("/management/members");
}

export async function updateProjectMemberRole(
  projectId: string,
  profileId: string,
  role: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_members")
    .update({ role })
    .eq("project_id", projectId)
    .eq("profile_id", profileId);

  if (error) throw new Error(error.message);
  revalidatePath("/management/members");
}

export async function removeMember(profileId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: self } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (self?.role !== "owner") {
    throw new Error("オーナーのみ実行できます");
  }

  // プロジェクトから削除
  await supabase.from("project_members").delete().eq("profile_id", profileId);
  // プロフィール削除
  await supabase.from("profiles").delete().eq("id", profileId);

  revalidatePath("/management/members");
}