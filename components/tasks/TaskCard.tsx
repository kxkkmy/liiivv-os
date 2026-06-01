"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskDialog } from "./TaskDialog";
import { updateTaskStatus, deleteTask } from "@/app/actions/tasks";
import { Calendar, User, Pencil, Trash2, ChevronRight } from "lucide-react";

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

const nextStatus: Record<string, string> = {
  todo: "in_progress",
  in_progress: "review",
  review: "done",
};

export function TaskCard({ task, members, projectId }: { task: Task; members?: Member[]; projectId: string }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const assignee = members?.find((m) => m.id === task.assignee_id);

  async function handleAdvance() {
    const next = nextStatus[task.status];
    if (!next) return;
    setLoading(true);
    try {
      await updateTaskStatus(task.id, next);
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("このタスクを削除しますか？")) return;
    await deleteTask(task.id);
  }

  return (
    <>
      <div
        className="bg-background border rounded-lg p-3 space-y-2 hover:shadow-sm transition-shadow cursor-pointer"
        onClick={() => setDetailOpen(true)}
      >
        <div className="text-sm font-medium leading-snug">{task.title}</div>
        <div className="flex items-center justify-between">
          <Badge variant={priorityColor[task.priority]} className="text-xs">
            {priorityLabel[task.priority]}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar size={10} />
                {new Date(task.due_date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}
              </div>
            )}
            {assignee && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-xs">
                  {assignee.display_name[0]}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{task.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">優先度</p>
                <Badge variant={priorityColor[task.priority]}>{priorityLabel[task.priority]}</Badge>
              </div>
              {task.due_date && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">期限</p>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(task.due_date).toLocaleDateString("ja-JP")}
                  </div>
                </div>
              )}
              {assignee && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">担当者</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">
                      {assignee.display_name[0]}
                    </div>
                    {assignee.display_name}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex gap-2">
                <TaskDialog
                  projectId={projectId}
                  task={task}
                  members={members}
                  trigger={
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <Pencil size={12} className="mr-1" />編集
                    </Button>
                  }
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 size={12} className="mr-1" />削除
                </Button>
              </div>
              {nextStatus[task.status] && (
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleAdvance}
                  disabled={loading}
                >
                  次のステップへ
                  <ChevronRight size={12} className="ml-1" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}