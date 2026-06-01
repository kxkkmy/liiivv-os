import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

const actionLabel: Record<string, string> = {
  created: "作成",
  updated: "更新",
  deleted: "削除",
  commented: "コメント",
  status_changed: "ステータス変更",
};

const entityLabel: Record<string, string> = {
  company: "企業",
  sponsorship: "協賛",
  task: "タスク",
  document: "ドキュメント",
  member: "メンバー",
  project: "プロジェクト",
  budget: "予算",
  actual: "実績",
};

export default async function ActivityPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*, profiles(display_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  // 日付でグループ化
  const grouped: Record<string, typeof logs> = {};
  logs?.forEach((log) => {
    const date = new Date(log.created_at).toLocaleDateString("ja-JP", {
      year: "numeric", month: "long", day: "numeric"
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date]!.push(log);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">操作履歴</h1>
        <p className="text-sm text-muted-foreground mt-0.5">全メンバーの操作ログ</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            操作履歴がありません
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([date, dayLogs]) => (
          <div key={date} className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">{date}</h2>
            <Card>
              <CardContent className="p-0">
                {dayLogs?.map((log, i) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-4 px-4 py-3 hover:bg-muted/30 transition-colors ${i !== 0 ? "border-t" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <Activity size={14} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {(log.profiles as any)?.display_name ?? "不明"}
                        </span>
                        <span className="text-sm text-muted-foreground">が</span>
                        <Badge variant="outline" className="text-xs">
                          {entityLabel[log.entity_type] ?? log.entity_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">を</span>
                        <Badge variant={log.action === "deleted" ? "destructive" : log.action === "created" ? "default" : "secondary"} className="text-xs">
                          {actionLabel[log.action] ?? log.action}
                        </Badge>
                      </div>
                      {log.diff && (
                        <div className="mt-1 text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1 font-mono">
                          {JSON.stringify(log.diff, null, 2).slice(0, 100)}
                          {JSON.stringify(log.diff).length > 100 ? "..." : ""}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {new Date(log.created_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
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