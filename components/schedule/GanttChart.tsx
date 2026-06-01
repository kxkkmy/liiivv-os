"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date?: string;
  created_at: string;
};

const statusColor: Record<string, string> = {
  todo: "bg-muted-foreground/30",
  in_progress: "bg-blue-500",
  review: "bg-yellow-500",
  done: "bg-green-500",
  cancelled: "bg-red-300",
};

const priorityColor: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  low: "outline", medium: "secondary", high: "default", urgent: "destructive",
};

const priorityLabel: Record<string, string> = {
  low: "低", medium: "中", high: "高", urgent: "緊急",
};

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function GanttChart({ tasks }: { tasks: Task[] }) {
  const today = new Date();
  const [viewStart, setViewStart] = useState(() => getMonday(today));

  const WEEKS = 12;
  const WEEK_WIDTH = 80;

  const weeks = Array.from({ length: WEEKS }, (_, i) => {
    const d = new Date(viewStart);
    d.setDate(viewStart.getDate() + i * 7);
    return d;
  });

  const months: { label: string; count: number }[] = [];
  weeks.forEach((d) => {
    const label = `${d.getFullYear()}年${d.getMonth() + 1}月`;
    if (months.length === 0 || months[months.length - 1].label !== label) {
      months.push({ label, count: 1 });
    } else {
      months[months.length - 1].count++;
    }
  });

  const todayWeekOffset = Math.floor((today.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24 * 7));

  function getTaskBar(task: Task) {
    if (!task.due_date) return null;
    const due = new Date(task.due_date);
    const start = new Date(task.created_at);

    const startWeek = Math.floor((start.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const endWeek = Math.floor((due.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24 * 7));

    if (endWeek < 0 || startWeek > WEEKS) return null;

    const left = Math.max(0, startWeek) * WEEK_WIDTH;
    const width = Math.max(1, Math.min(endWeek, WEEKS - 1) - Math.max(0, startWeek) + 1) * WEEK_WIDTH - 4;

    return { left, width };
  }

  function prevPeriod() {
    const d = new Date(viewStart);
    d.setDate(d.getDate() - WEEKS * 7);
    setViewStart(d);
  }

  function nextPeriod() {
    const d = new Date(viewStart);
    d.setDate(d.getDate() + WEEKS * 7);
    setViewStart(d);
  }

  function goToday() {
    setViewStart(getMonday(today));
  }

  const tasksWithDue = tasks.filter((t) => t.due_date && t.status !== "cancelled");
  const tasksWithoutDue = tasks.filter((t) => !t.due_date && t.status !== "cancelled");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={prevPeriod}><ChevronLeft size={14} /></Button>
        <Button size="sm" variant="outline" onClick={goToday}>今週</Button>
        <Button size="sm" variant="outline" onClick={nextPeriod}><ChevronRight size={14} /></Button>
        <span className="text-sm text-muted-foreground ml-2">
          {viewStart.getFullYear()}年{viewStart.getMonth() + 1}月{viewStart.getDate()}日 〜
        </span>
      </div>

      <div className="rounded-lg border bg-background overflow-hidden">
        <div className="flex">
          {/* タスク名カラム */}
          <div className="w-48 shrink-0 border-r">
            <div className="h-10 border-b bg-muted/50 flex items-center px-3">
              <span className="text-xs font-medium text-muted-foreground">タスク</span>
            </div>
            <div className="h-8 border-b bg-muted/20" />
            {tasksWithDue.map((task) => (
              <div key={task.id} className="h-10 border-b flex items-center px-3 gap-2">
                <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor[task.status]}`} />
                <span className="text-xs truncate">{task.title}</span>
              </div>
            ))}
          </div>

          {/* チャートエリア */}
          <div className="overflow-x-auto flex-1">
            <div style={{ width: WEEKS * WEEK_WIDTH }}>
              {/* 月ヘッダー */}
              <div className="h-10 border-b bg-muted/50 flex">
                {months.map((m, i) => (
                  <div
                    key={i}
                    className="border-r flex items-center justify-center text-xs font-medium text-muted-foreground"
                    style={{ width: m.count * WEEK_WIDTH }}
                  >
                    {m.label}
                  </div>
                ))}
              </div>

              {/* 週ヘッダー（月曜日の日付） */}
              <div className="h-8 border-b bg-muted/20 flex">
                {weeks.map((d, i) => (
                  <div
                    key={i}
                    className={`border-r flex items-center justify-center text-xs shrink-0 ${
                      i === todayWeekOffset ? "bg-blue-50 text-blue-600 font-bold" : "text-muted-foreground"
                    }`}
                    style={{ width: WEEK_WIDTH }}
                  >
                    {d.getMonth() + 1}/{d.getDate()}
                  </div>
                ))}
              </div>

              {/* タスクバー */}
              {tasksWithDue.map((task) => {
                const bar = getTaskBar(task);
                return (
                  <div key={task.id} className="h-10 border-b relative flex items-center">
                    {todayWeekOffset >= 0 && todayWeekOffset < WEEKS && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-10"
                        style={{ left: todayWeekOffset * WEEK_WIDTH }}
                      />
                    )}
                    {bar && (
                      <div
                        className={`absolute h-6 rounded flex items-center px-2 z-20 ${statusColor[task.status]}`}
                        style={{ left: bar.left + 2, width: bar.width }}
                        title={task.title}
                      >
                        <span className="text-xs text-white truncate font-medium">{task.title}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {tasksWithoutDue.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">期限未設定（{tasksWithoutDue.length}件）</h3>
          <div className="space-y-1">
            {tasksWithoutDue.map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border bg-background text-sm">
                <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor[task.status]}`} />
                <span className="flex-1">{task.title}</span>
                <Badge variant={priorityColor[task.priority]} className="text-xs">
                  {priorityLabel[task.priority]}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}