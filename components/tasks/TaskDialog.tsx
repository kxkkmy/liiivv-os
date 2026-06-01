"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createTask, updateTask } from "@/app/actions/tasks";
import { Plus } from "lucide-react";

type Task = {
  id?: string;
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date?: string;
  assignee_id?: string;
};

type Member = {
  id: string;
  display_name: string;
};

type Props = {
  projectId: string;
  defaultStatus?: string;
  task?: Task;
  members?: Member[];
  trigger?: React.ReactNode;
  onClose?: () => void;
};

export function TaskDialog({ projectId, defaultStatus = "todo", task, members, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "medium",
    status: task?.status ?? defaultStatus,
    due_date: task?.due_date ?? "",
    assignee_id: task?.assignee_id ?? "",
  });

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (task?.id) {
        await updateTask(task.id, {
          ...form,
          due_date: form.due_date || undefined,
          assignee_id: form.assignee_id === "none" ? undefined : form.assignee_id || undefined,
        });
      } else {
        await createTask({
          ...form,
          project_id_new: projectId,
          due_date: form.due_date || undefined,
          assignee_id: form.assignee_id === "none" ? undefined : form.assignee_id || undefined,
        });
      }
      setOpen(false);
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus size={14} className="mr-1" />
            タスク追加
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{task?.id ? "タスクを編集" : "タスクを追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>タイトル *</Label>
            <Input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="タスクのタイトル"
              required
            />
          </div>

          <div className="space-y-1">
            <Label>詳細</Label>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="タスクの詳細・メモ"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>優先度</Label>
              <Select value={form.priority} onValueChange={(v) => handleChange("priority", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">緊急</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>ステータス</Label>
              <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">未着手</SelectItem>
                  <SelectItem value="in_progress">進行中</SelectItem>
                  <SelectItem value="review">レビュー</SelectItem>
                  <SelectItem value="done">完了</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>期限</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => handleChange("due_date", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>担当者</Label>
              <Select value={form.assignee_id} onValueChange={(v) => handleChange("assignee_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未割り当て</SelectItem>
                  {members?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : task?.id ? "更新する" : "追加する"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}