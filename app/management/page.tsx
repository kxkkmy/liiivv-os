import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderOpen, CheckSquare, Key } from "lucide-react";

export default async function ManagementPage() {
  const supabase = await createClient();

  const [
    { count: membersCount },
    { count: projectsCount },
    { count: tasksCount },
    { count: codesCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("tasks_tasks").select("*", { count: "exact", head: true }),
    supabase.from("member_codes").select("*", { count: "exact", head: true }).eq("is_used", false),
  ]);

  const stats = [
    { label: "総メンバー数", value: membersCount ?? 0, icon: Users },
    { label: "プロジェクト数", value: projectsCount ?? 0, icon: FolderOpen },
    { label: "総タスク数", value: tasksCount ?? 0, icon: CheckSquare },
    { label: "未使用コード", value: codesCount ?? 0, icon: Key },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Liiivv Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">会社全体の管理・経営ダッシュボード</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
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