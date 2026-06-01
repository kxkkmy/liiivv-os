import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GanttChart } from "@/components/schedule/GanttChart";
import { TaskDialog } from "@/components/tasks/TaskDialog";

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

  const [{ data: tasks }, { data: members }] = await Promise.all([
    supabase
      .from("tasks_tasks")
      .select("id, title, status, priority, due_date, created_at, assignee_id, description")
      .eq("project_id_new", project.id)
      .neq("status", "cancelled")
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("project_members")
      .select("profiles(id, display_name)")
      .eq("project_id", project.id),
  ]);

  const memberList = members?.map((m: any) => m.profiles).filter(Boolean) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">スケジュール</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{project.name}のガントチャート</p>
        </div>
        <TaskDialog
          projectId={project.id}
          members={memberList}
        />
      </div>
      <GanttChart tasks={tasks ?? []} />
    </div>
  );
}