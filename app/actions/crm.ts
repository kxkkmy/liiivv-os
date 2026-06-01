"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCompany(data: {
  name: string;
  name_kana?: string;
  industry?: string;
  company_type?: string;
  website?: string;
  address?: string;
  prefecture?: string;
  phone?: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("crm_companies")
    .insert([{ ...data, status: "prospect" }]);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/crm", "page");
}

export async function updateCompany(id: string, data: {
  name?: string;
  industry?: string;
  company_type?: string;
  website?: string;
  address?: string;
  prefecture?: string;
  phone?: string;
  status?: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("crm_companies")
    .update(data)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/crm", "page");
}

export async function createSponsorship(data: {
  company_id: string;
  plan_name: string;
  amount: number;
  benefits?: any;
  notes?: string;
  event_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("crm_sponsorships")
    .insert([{
      ...data,
      owner_id: user.id,
      proposal_status: "draft",
      contract_status: "none",
      invoice_status: "none",
    }]);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/crm", "page");
}

export async function updateSponsorshipStatus(id: string, field: string, value: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("crm_sponsorships")
    .update({ [field]: value })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/crm", "page");
}

export async function deleteCompany(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("crm_companies")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/crm", "page");
}

export async function deleteSponsorship(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("crm_sponsorships")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/projects/[slug]/crm", "page");
}