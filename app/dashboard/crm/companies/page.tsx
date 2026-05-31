import { createClient } from "@/lib/supabase/server";
import { CompanyTable } from "@/components/crm/CompanyTable";

export default async function CompaniesPage() {
  const supabase = await createClient();

  const { data: companies } = await supabase
  .from("crm_companies")
  .select("id, name, company_type, prefecture, status, updated_at")
  .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">企業管理</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          取引先・スポンサー候補の企業一覧
        </p>
      </div>
      <CompanyTable companies={companies ?? []} />
    </div>
  );
}