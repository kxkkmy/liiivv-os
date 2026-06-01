import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Key, Archive } from "lucide-react";
import Link from "next/link";
import { archiveProject, updateProjectPassword } from "@/app/actions/projects";

export default async function ManagementProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*, project_members(id, profiles(display_name))")
    .order("created_at");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">プロジェクト管理</h1>
          <p className="text-sm text-muted-foreground mt-0.5">全プロジェクトの管理・設定</p>
        </div>
        <Link href="/management/projects/new">
          <Button size="sm">
            <Plus size={14} className="mr-1" />
            プロジェクト作成
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {!projects || projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              プロジェクトがありません
            </CardContent>
          </Card>
        ) : (
          projects.map((p) => {
            const members = (p.project_members as any[]) ?? [];
            return (
              <Card key={p.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <Badge variant={p.status === "active" ? "default" : "secondary"}>
                        {p.status === "active" ? "進行中" : "アーカイブ"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{p.description}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* メンバー */}
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{members.length}名</span>
                    <div className="flex gap-1 ml-1">
                      {members.slice(0, 5).map((m: any) => (
                        <div
                          key={m.id}
                          className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium"
                          title={m.profiles?.display_name}
                        >
                          {m.profiles?.display_name?.[0] ?? "U"}
                        </div>
                      ))}
                      {members.length > 5 && (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          +{members.length - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 参加情報 */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">参加コード</p>
                      <code className="font-mono font-medium">{p.join_code}</code>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">参加パスワード</p>
                      <code className="font-mono font-medium">{p.join_password}</code>
                    </div>
                  </div>

                  {/* アクション */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {p.status === "active" && (
                      <form action={async () => {
                        "use server";
                        await archiveProject(p.id);
                      }}>
                        <Button size="sm" variant="outline" type="submit">
                          <Archive size={14} className="mr-1" />
                          アーカイブ
                        </Button>
                      </form>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}