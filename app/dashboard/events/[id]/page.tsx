import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Users, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const permitLabel: Record<string, string> = {
  police: "警察",
  fire: "消防",
  health: "保健所",
  venue: "施設",
  other: "その他",
};

const permitStatusColor: Record<string, "default" | "secondary" | "outline"> = {
  not_started: "outline",
  preparing: "secondary",
  submitted: "secondary",
  approved: "default",
  rejected: "outline",
};

const permitStatusLabel: Record<string, string> = {
  not_started: "未着手",
  preparing: "準備中",
  submitted: "申請済み",
  approved: "承認済み",
  rejected: "却下",
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events_events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const [
    { data: performers },
    { data: staff },
    { data: permits },
    { data: timetable },
  ] = await Promise.all([
    supabase.from("events_performers").select("*").eq("event_id", id),
    supabase.from("events_staff").select("*").eq("event_id", id),
    supabase.from("events_permits").select("*").eq("event_id", id),
    supabase.from("events_timetable").select("*").eq("event_id", id).order("start_time"),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/events">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{event.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{event.concept}</p>
        </div>
        <Button size="sm" variant="outline">編集</Button>
      </div>

      {/* 基本情報 */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">開催情報</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {event.event_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} />
                {new Date(event.event_date).toLocaleDateString("ja-JP")}
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
            {(event.open_time || event.close_time) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} />
                {event.open_time} 〜 {event.close_time}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 申請管理 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">申請管理</CardTitle>
            <Button size="sm" variant="outline">+ 追加</Button>
          </CardHeader>
          <CardContent>
            {!permits || permits.length === 0 ? (
              <p className="text-sm text-muted-foreground">申請が登録されていません</p>
            ) : (
              <div className="space-y-2">
                {permits.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span>{permitLabel[p.permit_type]} — {p.authority}</span>
                    <Badge variant={permitStatusColor[p.status]}>
                      {permitStatusLabel[p.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 出演者 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">出演者</CardTitle>
          <Button size="sm" variant="outline">+ 追加</Button>
        </CardHeader>
        <CardContent>
          {!performers || performers.length === 0 ? (
            <p className="text-sm text-muted-foreground">出演者が登録されていません</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {performers.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-muted-foreground">{p.category} · {p.genre}</div>
                  </div>
                  <Badge variant={p.contract_status === "contracted" ? "default" : "outline"}>
                    {p.contract_status === "contracted" ? "契約済" : "交渉中"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* タイムテーブル */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">タイムテーブル</CardTitle>
          <Button size="sm" variant="outline">+ 追加</Button>
        </CardHeader>
        <CardContent>
          {!timetable || timetable.length === 0 ? (
            <p className="text-sm text-muted-foreground">タイムテーブルが登録されていません</p>
          ) : (
            <div className="space-y-2">
              {timetable.map((t) => (
                <div key={t.id} className="flex items-center gap-4 text-sm py-2 border-b last:border-0">
                  <div className="text-muted-foreground w-32 shrink-0">
                    {new Date(t.start_time).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                    {" 〜 "}
                    {new Date(t.end_time).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="font-medium">{t.title}</div>
                  {t.stage && <Badge variant="outline">{t.stage}</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* スタッフ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">スタッフ・ボランティア</CardTitle>
          <Button size="sm" variant="outline">+ 追加</Button>
        </CardHeader>
        <CardContent>
          {!staff || staff.length === 0 ? (
            <p className="text-sm text-muted-foreground">スタッフが登録されていません</p>
          ) : (
            <div className="space-y-2">
              {staff.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-muted-foreground">{s.role} · {s.department}</div>
                  </div>
                  <Badge variant={s.status === "confirmed" ? "default" : "outline"}>
                    {s.status === "confirmed" ? "確定" : "未確定"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}