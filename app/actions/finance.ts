"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBudget(data: {
  event_id?: string;
  category: string;
  plan_type: "revenue" | "expense";
  amount: number;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("finance_budgets")
    .insert([data]);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/finance", "page");
}

export async function createActual(data: {
  budget_id?: string;
  event_id?: string;
  category: string;
  plan_type: "revenue" | "expense";
  amount: number;
  recorded_at?: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("finance_actuals")
    .insert([data]);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/finance", "page");
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("finance_budgets")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/finance", "page");
}

export async function deleteActual(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("finance_actuals")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/finance", "page");
}