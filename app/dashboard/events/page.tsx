import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Plus } from "lucide-react";
import Link from "next/link";

const statusLabel: Record<string, string> = {
  planning: "企画中",
  confirmed: "確定",
  running: "開催中",
  closed: "終了",
  cancelled: "中止",
};

const statusColor: Record<string, "default" | "secondary" | "outline"> = {
  planning: "secondary",
  confirmed: "default",
  running: "default",
  closed: "outline",
  cancelled: "outline",
};

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events_events")
    .select("*")
    .order("event_date", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">イベント管理</h1>
          <p className="text-sm text-muted-foreground mt-0.5">開催イベントの一覧</p>
        </div>
        <Button size="sm">
          <Plus size={14} className="mr-1" />
          イベント追加
        </Button>
      </div>

      {!events || events.length === 0 ? (
        <div className="rounded-lg border bg-background p-12 text-center text-sm text-muted-foreground">
          イベントが登録されていません
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((e) => (
            <Link key={e.id} href={`/dashboard/events/${e.id}`}>
              <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-base">{e.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">{e.concept}</p>
                  </div>
                  <Badge variant={statusColor[e.status]}>{statusLabel[e.status]}</Badge>
                </CardHeader>
                <CardContent className="flex gap-6 text-sm text-muted-foreground">
                  {e.event_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(e.event_date).toLocaleDateString("ja-JP")}
                    </div>
                  )}
                  {e.venue_name && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {e.venue_name}
                    </div>
                  )}
                  {e.capacity && (
                    <div className="flex items-center gap-1.5">
                      <Users size={14} />
                      最大{e.capacity.toLocaleString()}名
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}