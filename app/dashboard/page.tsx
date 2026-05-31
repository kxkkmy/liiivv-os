import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calendar, CheckSquare, Users } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: companiesCount },
    { count: tasksCount },
    { count: membersCount },
  ] = await Promise.all([
    supabase.from("crm.companies").select("*", { count: "exact", head: true }),
    supabase.from("tasks.tasks").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "企業数", value: companiesCount ?? 0, icon: Building2 },
    { label: "タスク", value: tasksCount ?? 0, icon: CheckSquare },
    { label: "メンバー", value: membersCount ?? 0, icon: Users },
    { label: "イベント", value: 1, icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">ダッシュボード</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Liiivv OS へようこそ</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}