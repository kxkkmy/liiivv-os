import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

export default async function ProjectFinancePage({
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

  const { data: events } = await supabase
    .from("events_events")
    .select("id")
    .limit(1);

  const eventId = events?.[0]?.id;

  const [{ data: budgets }, { data: actuals }, { data: sponsorships }] = await Promise.all([
    supabase.from("finance_budgets").select("*").eq("event_id", eventId ?? ""),
    supabase.from("finance_actuals").select("*").eq("event_id", eventId ?? ""),
    supabase.from("crm_sponsorships").select("amount, invoice_status, proposal_status"),
  ]);

  const totalRevenueBudget = budgets?.filter((b) => b.plan_type === "revenue").reduce((s, b) => s + (b.amount ?? 0), 0) ?? 0;
  const totalExpenseBudget = budgets?.filter((b) => b.plan_type === "expense").reduce((s, b) => s + (b.amount ?? 0), 0) ?? 0;
  const totalRevenueActual = actuals?.filter((a) => a.plan_type === "revenue").reduce((s, a) => s + (a.amount ?? 0), 0) ?? 0;
  const totalExpenseActual = actuals?.filter((a) => a.plan_type === "expense").reduce((s, a) => s + (a.amount ?? 0), 0) ?? 0;

  const sponsorAgreed = sponsorships?.filter((s) => s.proposal_status === "agreed").reduce((s, sp) => s + (sp.amount ?? 0), 0) ?? 0;
  const sponsorPaid = sponsorships?.filter((s) => s.invoice_status === "paid").reduce((s, sp) => s + (sp.amount ?? 0), 0) ?? 0;
  const TARGET = 25000000;
  const pct = Math.min(Math.round((sponsorAgreed / TARGET) * 100), 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Finance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{project.name}の予算管理</p>
        </div>
        <Button size="sm">
          <Plus size={14} className="mr-1" />
          予算追加
        </Button>
      </div>

      {/* 協賛進捗 */}
      {slug === "chapter18" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">協賛獲得進捗</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">合意済み</span>
              <span className="font-semibold">¥{sponsorAgreed.toLocaleString()} / ¥{TARGET.toLocaleString()}</span>
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
      )}

      {/* 収支サマリー */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "収入予算", value: totalRevenueBudget, icon: TrendingUp },
          { label: "収入実績", value: totalRevenueActual, icon: DollarSign },
          { label: "支出予算", value: totalExpenseBudget, icon: TrendingDown },
          { label: "支出実績", value: totalExpenseActual, icon: Target },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">¥{value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 収支詳細 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">収支詳細</CardTitle>
          <Button size="sm" variant="outline">
            <Plus size={14} className="mr-1" />
            項目追加
          </Button>
        </CardHeader>
        <CardContent>
          {!budgets || budgets.length === 0 ? (
            <p className="text-sm text-muted-foreground">予算が登録されていません</p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">カテゴリ</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">種別</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">予算</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">実績</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b) => {
                    const actual = actuals?.find((a) => a.budget_id === b.id);
                    return (
                      <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{b.category}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {b.plan_type === "revenue" ? "収入" : "支出"}
                        </td>
                        <td className="px-4 py-3 text-right">¥{b.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          {actual ? `¥${actual.amount.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}