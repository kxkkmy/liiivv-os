import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

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

export default async function SponsorsPage() {
  const supabase = await createClient();

  const { data: sponsorships } = await supabase
    .from("crm_sponsorships")
    .select(`
      *,
      crm_companies (name)
    `)
    .order("created_at", { ascending: false });

  const totalAmount = sponsorships?.reduce((sum, s) => sum + (s.amount ?? 0), 0) ?? 0;
  const agreedCount = sponsorships?.filter((s) => s.proposal_status === "agreed").length ?? 0;
  const paidCount = sponsorships?.filter((s) => s.invoice_status === "paid").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">スポンサー管理</h1>
          <p className="text-sm text-muted-foreground mt-0.5">CHAPTER18 協賛状況</p>
        </div>
        <Button size="sm">
          <Plus size={14} className="mr-1" />
          協賛追加
        </Button>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">協賛総額（予定）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">¥{totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">目標: ¥25,000,000</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">合意済み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{agreedCount}社</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">入金済み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{paidCount}社</div>
          </CardContent>
        </Card>
      </div>

      {/* 一覧 */}
      <div className="rounded-lg border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">企業名</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">プラン</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">金額</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">提案状況</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">契約状況</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">請求状況</th>
            </tr>
          </thead>
          <tbody>
            {!sponsorships || sponsorships.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  協賛が登録されていません
                </td>
              </tr>
            ) : (
              sponsorships.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {(s.crm_companies as any)?.name ?? "—"}
                  </td>
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
  );
}