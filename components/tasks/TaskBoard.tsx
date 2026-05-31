"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Task = {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_date: string | null;
  assignee_id: string | null;
};

const columns = [
  { key: "todo", label: "未着手" },
  { key: "in_progress", label: "進行中" },
  { key: "review", label: "レビュー" },
  { key: "done", label: "完了" },
];

const priorityColor: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
};

const priorityLabel: Record<string, string> = {
  low: "低",
  medium: "中",
  high: "高",
  urgent: "緊急",
};

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const [items, setItems] = useState(tasks);

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((col) => {
        const colTasks = items.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{col.label}</span>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {colTasks.length}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus size={12} />
              </Button>
            </div>
            <div className="space-y-2 min-h-24">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-background border rounded-lg p-3 space-y-2 hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <div className="text-sm font-medium leading-snug">{task.title}</div>
                  <div className="flex items-center justify-between">
                    <Badge variant={priorityColor[task.priority]} className="text-xs">
                      {priorityLabel[task.priority]}
                    </Badge>
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(task.due_date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}