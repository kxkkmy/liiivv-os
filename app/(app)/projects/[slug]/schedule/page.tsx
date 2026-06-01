import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar } from "lucide-react";

const statusColor: Record<string, "default" | "secondary" | "outline"> = {
  todo: "outline",
  in_progress: "secondary",
  done: "default",
  cancelled: "outline",
};

const statusLabel: Record<string, string> = {
  todo: "未着手",
  in_progress: "進行中",
  done: "完了",
  cancelled: "中止",
};

const priorityColor: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
};

export default async function ProjectSchedulePage({
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

  const { data: tasks } = await supabase
    .from("tasks_tasks")
    .select("id, title, status, priority, due_date, assignee_id")
    .eq("project_id_new", project.id)
    .not("due_date", "is", null)
    .neq("status", "cancelled")
    .order("due_date", { ascending: true });

  // 月ごとにグループ化
  const grouped: Record<string, typeof tasks> = {};
  tasks?.forEach((t) => {
    const month = new Date(t.due_date!).toLocaleDateString("ja-JP", { year: "numeric", month: "long" });
    if (!grouped[month]) grouped[month] = [];
    grouped[month]!.push(t);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">スケジュール</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{project.name}のスケジュール管理</p>
        </div>
        <Button size="sm">
          <Plus size={14} className="mr-1" />
          タスク追加
        </Button>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            期限付きのタスクがありません
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([month, monthTasks]) => (
          <div key={month} className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-muted-foreground" />
              <h2 className="text-sm font-medium text-muted-foreground">{month}</h2>
              <span className="text-xs text-muted-foreground">({monthTasks?.length}件)</span>
            </div>
            <Card>
              <CardContent className="p-0">
                {monthTasks?.map((task, i) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors ${i !== 0 ? "border-t" : ""}`}
                  >
                    <div className="text-sm text-muted-foreground w-16 shrink-0">
                      {new Date(task.due_date!).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}
                    </div>
                    <div className="flex-1 text-sm font-medium">{task.title}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={priorityColor[task.priority]} className="text-xs">
                        {task.priority === "urgent" ? "緊急" : task.priority === "high" ? "高" : task.priority === "medium" ? "中" : "低"}
                      </Badge>
                      <Badge variant={statusColor[task.status]} className="text-xs">
                        {statusLabel[task.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}