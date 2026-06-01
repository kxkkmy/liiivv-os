import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Layers, Building2, Plus, LogOut, Settings, CheckSquare } from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, any> = {
  calendar: Calendar,
  layers: Layers,
  building: Building2,
};

export default async function HomePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user!.id)
    .single();

  const isExec = ["owner", "admin"].includes(profile?.role ?? "");

  const { data: memberOf } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("profile_id", user!.id);

  const projectIds = memberOf?.map((m) => m.project_id) ?? [];

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .in("id", projectIds.length > 0 ? projectIds : ["00000000-0000-0000-0000-000000000000"])
    .eq("status", "active")
    .order("created_at");

  const { data: myTasks } = await supabase
    .from("tasks_tasks")
    .select("id, title, status, priority, due_date")
    .eq("assignee_id", user!.id)
    .neq("status", "done")
    .neq("status", "cancelled")
    .order("due_date", { ascending: true })
    .limit(5);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ヘッダー */}
      <header className="h-14 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-10">
        <span className="font-semibold tracking-tight">Liiivv OS</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{profile?.display_name}</span>
          {isExec && (
            <Link href="/management">
              <Button size="sm" variant="outline">
                <Settings size={14} className="mr-1" />
                Management
              </Button>
            </Link>
          )}
          <form action="/api/auth/logout" method="POST">
            <Button size="sm" variant="ghost">
              <LogOut size={14} />
            </Button>
          </form>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ウェルカム */}
        <div>
          <h1 className="text-2xl font-semibold">おはようございます、{profile?.display_name}さん</h1>
          <p className="text-sm text-muted-foreground mt-1">今日もよろしくお願いします。</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 左カラム：プロジェクト + タスク */}
          <div className="col-span-2 space-y-6">

            {/* プロジェクト */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold">プロジェクト</h2>
                <Link href="/join">
                  <Button size="sm" variant="outline">
                    <Plus size={14} className="mr-1" />
                    参加する
                  </Button>
                </Link>
              </div>
              {projects && projects.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {projects.map((project) => {
                    const Icon = iconMap[project.icon] ?? Building2;
                    return (
                      <Link key={project.id} href={`/projects/${project.slug}`}>
                        <Card className="hover:shadow-md transition-all cursor-pointer hover:bg-background">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-md bg-foreground flex items-center justify-center shrink-0">
                                <Icon size={16} className="text-background" />
                              </div>
                              <div>
                                <CardTitle className="text-sm">{project.name}</CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center space-y-3">
                    <p className="text-sm text-muted-foreground">参加しているプロジェクトがありません</p>
                    <Link href="/join">
                      <Button size="sm">
                        <Plus size={14} className="mr-1" />
                        プロジェクトに参加する
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 自分のタスク */}
            <div>
              <h2 className="text-base font-semibold mb-3">自分のタスク</h2>
              <Card>
                <CardContent className="p-0">
                  {!myTasks || myTasks.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      未完了のタスクはありません
                    </div>
                  ) : (
                    myTasks.map((task, i) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors ${i !== 0 ? "border-t" : ""}`}
                      >
                        <CheckSquare size={14} className="text-muted-foreground shrink-0" />
                        <div className="flex-1 text-sm font-medium">{task.title}</div>
                        <div className="flex items-center gap-2 shrink-0">
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.due_date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}
                            </span>
                          )}
                          <Badge
                            variant={task.priority === "urgent" ? "destructive" : task.priority === "high" ? "default" : "outline"}
                            className="text-xs"
                          >
                            {task.priority === "urgent" ? "緊急" : task.priority === "high" ? "高" : task.priority === "medium" ? "中" : "低"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 右カラム：情報 */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">アカウント</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">名前</span>
                  <span className="font-medium">{profile?.display_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">権限</span>
                  <Badge variant="outline" className="text-xs">
                    {profile?.role === "owner" ? "オーナー" :
                     profile?.role === "admin" ? "管理者" :
                     profile?.role === "manager" ? "マネージャー" : "メンバー"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">参加PJ</span>
                  <span>{projects?.length ?? 0}件</span>
                </div>
              </CardContent>
            </Card>

            {isExec && (
              <Card className="border-dashed">
                <CardContent className="py-4 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">管理者メニュー</p>
                  <Link href="/management">
                    <Button size="sm" className="w-full">
                      Management へ
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}