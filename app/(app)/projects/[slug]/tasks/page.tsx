import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ProjectTasksPage({
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
    .select("id, title, priority, status, due_date, assignee_id")
    .eq("project_id_new", project.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">タスク</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{project.name}のタスク管理</p>
        </div>
        <Button size="sm">
          <Plus size={14} className="mr-1" />
          タスク追加
        </Button>
      </div>
      <TaskBoard tasks={tasks ?? []} />
    </div>
  );
}