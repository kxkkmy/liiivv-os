import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { TaskBoard } from "@/components/tasks/TaskBoard";

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

  const [{ data: tasks }, { data: members }] = await Promise.all([
    supabase
      .from("tasks_tasks")
      .select("id, title, description, priority, status, due_date, assignee_id")
      .eq("project_id_new", project.id)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false }),
    supabase
      .from("project_members")
      .select("profiles(id, display_name)")
      .eq("project_id", project.id),
  ]);

  const memberList = members?.map((m: any) => m.profiles).filter(Boolean) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">タスク</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{project.name}のタスク管理</p>
      </div>
      <TaskBoard
        tasks={tasks ?? []}
        projectId={project.id}
        members={memberList}
      />
    </div>
  );
}