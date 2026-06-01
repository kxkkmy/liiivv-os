import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Users, BookOpen, Calendar, MapPin, Target, FileText } from "lucide-react";
import Link from "next/link";

export default async function ProjectPage({
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

  const { data: members } = await supabase
    .from("project_members")
    .select("*, profiles(display_name, title)")
    .eq("project_id", project.id);

  const { data: tasks } = await supabase
    .from("tasks_tasks")
    .select("id, status")
    .eq("project_id_new", project.id);

  const { data: docs } = await supabase
    .from("knowledge_documents")
    .select("id")
    .eq("project_id_new", project.id);

  const { data: events } = slug === "chapter18"
  ? await supabase
      .from("events_events")
      .select("*")
      .order("event_date", { ascending: true })
      .limit(1)
  : { data: null };

const event = events?.[0] ?? null;
  const todoCount = tasks?.filter((t) => t.status === "todo").length ?? 0;
  const inProgressCount = tasks?.filter((t) => t.status === "in_progress").length ?? 0;
  const doneCount = tasks?.filter((t) => t.status === "done").length ?? 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold">{project.name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
      </div>

      {/* イベント情報 */}
      {event && (
        <Card className="border-l-4 border-l-foreground">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">イベント情報</CardTitle>
              <Badge variant={event.status === "confirmed" ? "default" : "secondary"}>
                {event.status === "planning" ? "企画中" : "確定"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            {event.event_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} />
                {new Date(event.event_date).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            )}
            {event.venue_name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={14} />
                {event.venue_name}
              </div>
            )}
            {event.capacity && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users size={14} />
                最大{event.capacity.toLocaleString()}名
              </div>
            )}
            {event.concept && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target size={14} />
                {event.concept}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* タスクサマリー */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "未着手", value: todoCount, icon: CheckSquare },
          { label: "進行中", value: inProgressCount, icon: CheckSquare },
          { label: "完了", value: doneCount, icon: CheckSquare },
          { label: "ドキュメント", value: docs?.length ?? 0, icon: FileText },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* メンバー */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">メンバー ({members?.length ?? 0}名)</CardTitle>
          <Link href={`/projects/${slug}/members`} className="text-xs text-muted-foreground hover:text-foreground">
            全て見る →
          </Link>
        </CardHeader>
        <CardContent>
          {!members || members.length === 0 ? (
            <p className="text-sm text-muted-foreground">メンバーが登録されていません</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {members.slice(0, 6).map((m) => {
                const profile = m.profiles as any;
                return (
                  <div key={m.id} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                      {profile?.display_name?.[0] ?? "U"}
                    </div>
                    <div>
                      <div className="font-medium">{profile?.display_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{profile?.title ?? m.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* クイックリンク */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "タスク", href: `/projects/${slug}/tasks`, icon: CheckSquare },
          { label: "ナレッジ", href: `/projects/${slug}/knowledge`, icon: BookOpen },
          { label: "メンバー", href: `/projects/${slug}/members`, icon: Users },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href}>
            <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 py-4">
                <Icon size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}