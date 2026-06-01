"use client";

import { TaskCard } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Task = {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  due_date?: string;
  assignee_id?: string;
};

type Member = {
  id: string;
  display_name: string;
};

const columns = [
  { key: "todo", label: "未着手" },
  { key: "in_progress", label: "進行中" },
  { key: "review", label: "レビュー" },
  { key: "done", label: "完了" },
];

export function TaskBoard({
  tasks,
  projectId,
  members,
}: {
  tasks: Task[];
  projectId: string;
  members?: Member[];
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{col.label}</span>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {colTasks.length}
                </span>
              </div>
              <TaskDialog
                projectId={projectId}
                defaultStatus={col.key}
                members={members}
                trigger={
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus size={12} />
                  </Button>
                }
              />
            </div>
            <div className="space-y-2 min-h-24">
              {colTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  members={members}
                  projectId={projectId}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}