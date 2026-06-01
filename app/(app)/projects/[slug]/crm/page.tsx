import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

const proposalLabel: Record<string, string> = {
  draft: "下書き",
  sent: "送付済み",
  negotiating: "交渉中",
  agreed: "合意",
  rejected: "不成立",
};

const contractLabel: Record<string, string> = {
  none: "未締結",
  sent: "送付済み",
  signed: "締結済み",
  cancelled: "解除",
};

const invoiceLabel: Record<string, string> = {
  none: "未請求",
  issued: "請求済み",
  partial: "一部入金",
  paid: "入金済み",
  overdue: "延滞",
};

export default async function ProjectCrmPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) notFound();

  const [{ data: sponsorships }, { data: companies }] = await Promise.all([
    supabase.from("crm_sponsorships").select("*, crm_companies(name)").order("created_at", { ascending: false }),
    supabase.from("crm_companies").select("id, name, company_type, status, prefecture").order("updated_at", { ascending: false }),
  ]);

  const agreedAmount = sponsorships?.filter((s) => s.proposal_status === "agreed").reduce((s, sp) => s + (sp.amount ?? 0), 0) ?? 0;
  const TARGET = 25000000;
  const pct = Math.min(Math.round((agreedAmount / TARGET) * 100), 100);

  const typeLabel: Record<string, string> = {
    sponsor: "スポンサー",
    media: "メディア",
    government: "自治体",
    school: "学校",
    ngo: "団体",
    other: "その他",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">CRM</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{project.name}の営業・顧客管理</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Plus size={14} className="mr-1" />企業追加
          </Button>
          <Button size="sm">
            <Plus size={14} className="mr-1" />協賛追加
          </Button>
        </div>
      </div>

      {/* 協賛進捗 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">協賛獲得進捗</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">合意済み</span>
            <span className="font-semibold">¥{agreedAmount.toLocaleString()} / ¥{TARGET.toLocaleString()}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-foreground h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{pct}% 達成</span>
            <span>目標: ¥25,000,000</span>
          </div>
        </CardContent>
      </Card>

      {/* 企業一覧 */}
      <div>
        <h2 className="text-base font-medium mb-3">企業一覧</h2>
        <div className="rounded-lg border bg-background overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">企業名</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">種別</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">都道府県</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {!companies || companies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-muted-foreground">企業が登録されていません</td>
                </tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{typeLabel[c.company_type] ?? c.company_type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.prefecture ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={c.status === "active" ? "default" : "outline"}>
                        {c.status === "active" ? "取引中" : c.status === "prospect" ? "見込み" : "非アクティブ"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 協賛一覧 */}
      <div>
        <h2 className="text-base font-medium mb-3">協賛一覧</h2>
        <div className="rounded-lg border bg-background overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">企業名</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">プラン</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">金額</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">提案</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">契約</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">請求</th>
              </tr>
            </thead>
            <tbody>
              {!sponsorships || sponsorships.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">協賛が登録されていません</td>
                </tr>
              ) : (
                sponsorships.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{(s.crm_companies as any)?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.plan_name}</td>
                    <td className="px-4 py-3 font-medium">¥{s.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.proposal_status === "agreed" ? "default" : "secondary"}>
                        {proposalLabel[s.proposal_status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.contract_status === "signed" ? "default" : "outline"}>
                        {contractLabel[s.contract_status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.invoice_status === "paid" ? "default" : "outline"}>
                        {invoiceLabel[s.invoice_status]}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}