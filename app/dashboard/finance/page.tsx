import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

export default async function FinancePage() {
  const supabase = await createClient();

  const [
    { data: budgets },
    { data: actuals },
    { data: kpis },
    { data: sponsorships },
  ] = await Promise.all([
    supabase.from("finance_budgets").select("*"),
    supabase.from("finance_actuals").select("*"),
    supabase.from("finance_kpi_snapshots").select("*").order("snapshot_date", { ascending: false }).limit(1),
    supabase.from("crm_sponsorships").select("amount, invoice_status, proposal_status"),
  ]);

  const totalRevenueBudget = budgets?.filter((b) => b.plan_type === "revenue").reduce((s, b) => s + (b.amount ?? 0), 0) ?? 0;
  const totalExpenseBudget = budgets?.filter((b) => b.plan_type === "expense").reduce((s, b) => s + (b.amount ?? 0), 0) ?? 0;
  const totalRevenueActual = actuals?.filter((a) => a.plan_type === "revenue").reduce((s, a) => s + (a.amount ?? 0), 0) ?? 0;
  const totalExpenseActual = actuals?.filter((a) => a.plan_type === "expense").reduce((s, a) => s + (a.amount ?? 0), 0) ?? 0;

  const sponsorTotal = sponsorships?.reduce((s, sp) => s + (sp.amount ?? 0), 0) ?? 0;
  const sponsorPaid = sponsorships?.filter((sp) => sp.invoice_status === "paid").reduce((s, sp) => s + (sp.amount ?? 0), 0) ?? 0;
  const sponsorAgreed = sponsorships?.filter((sp) => sp.proposal_status === "agreed").reduce((s, sp) => s + (sp.amount ?? 0), 0) ?? 0;

  const latestKpi = kpis?.[0];

  const TARGET_SPONSORSHIP = 25000000;
  const progressPct = Math.min(Math.round((sponsorAgreed / TARGET_SPONSORSHIP) * 100), 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Finance Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">CHAPTER18 収支・KPI</p>
      </div>

      {/* 協賛進捗 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">協賛獲得進捗</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">合意済み</span>
            <span className="font-semibold">¥{sponsorAgreed.toLocaleString()} / ¥{TARGET_SPONSORSHIP.toLocaleString()}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-foreground h-2 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progressPct}% 達成</span>
            <span>目標: ¥25,000,000</span>
          </div>
        </CardContent>
      </Card>

      {/* 収支サマリー */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">収入予算</CardTitle>
            <TrendingUp size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">¥{totalRevenueBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">収入実績</CardTitle>
            <DollarSign size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">¥{totalRevenueActual.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">支出予算</CardTitle>
            <TrendingDown size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">¥{totalExpenseBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">支出実績</CardTitle>
            <Target size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">¥{totalExpenseActual.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* KPI */}
      {latestKpi && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">CAC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                ¥{latestKpi.cac?.toLocaleString() ?? "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">顧客獲得コスト</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">LTV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                ¥{latestKpi.ltv?.toLocaleString() ?? "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">顧客生涯価値</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ROAS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {latestKpi.roas ?? "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">広告費用対効果</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 協賛内訳 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">協賛内訳</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">登録済み協賛総額</span>
              <span className="font-semibold">¥{sponsorTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">合意済み</span>
              <span className="font-semibold">¥{sponsorAgreed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">入金済み</span>
              <span className="font-semibold">¥{sponsorPaid.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}