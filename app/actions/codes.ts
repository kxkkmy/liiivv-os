"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "LIIIVV-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function generateMemberCodes(count: number) {
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

  const codes = Array.from({ length: count }, () => ({ code: generateCode() }));

  const { error } = await supabase.from("member_codes").insert(codes);
  if (error) throw new Error(error.message);

  revalidatePath("/management/codes");
}

export async function deleteMemberCode(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("member_codes")
    .delete()
    .eq("id", id)
    .eq("is_used", false);

  if (error) throw new Error(error.message);
  revalidatePath("/management/codes");
}