"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { updateMemberRole, removeMember } from "@/app/actions/members";
import { ChevronDown, Trash2, Shield } from "lucide-react";

const roleLabel: Record<string, string> = {
  owner: "オーナー",
  admin: "管理者",
  manager: "マネージャー",
  member: "メンバー",
  viewer: "閲覧者",
};

type Member = {
  id: string;
  display_name: string;
  role: string;
  title?: string;
  department?: string;
  created_at: string;
  project_members?: { project_id: string; role: string; projects?: { name: string } }[];
};

export function MemberCard({ member, isSelf }: { member: Member; isSelf: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const projects = member.project_members?.map((pm) => pm.projects?.name).filter(Boolean) ?? [];

  async function handleRoleChange(role: string) {
    setLoading(true);
    try {
      await updateMemberRole(member.id, role);
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  }

  async function handleRemove() {
    if (!confirm(`${member.display_name}を削除しますか？`)) return;
    setLoading(true);
    try {
      await removeMember(member.id);
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div
          className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-sm">{member.display_name?.[0] ?? "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{member.display_name}</span>
              {isSelf && <Badge variant="outline" className="text-xs">あなた</Badge>}
            </div>
            <div className="text-xs text-muted-foreground">
              {member.title}{member.department ? ` · ${member.department}` : ""}
              {projects.length > 0 ? ` · ${projects.join(", ")}` : ""}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={member.role === "owner" ? "default" : "outline"} className="text-xs">
              {roleLabel[member.role] ?? member.role}
            </Badge>
            <ChevronDown size={14} className={`text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </div>
        </div>

        {expanded && (
          <div className="border-t px-4 py-4 space-y-4 bg-muted/20">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">システム権限</p>
                <Select
                  defaultValue={member.role}
                  onValueChange={handleRoleChange}
                  disabled={isSelf || loading}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">オーナー</SelectItem>
                    <SelectItem value="admin">管理者</SelectItem>
                    <SelectItem value="manager">マネージャー</SelectItem>
                    <SelectItem value="member">メンバー</SelectItem>
                    <SelectItem value="viewer">閲覧者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">参加プロジェクト</p>
                <div className="text-sm py-1">
                  {projects.length > 0 ? projects.map((p) => (
                    <Badge key={p} variant="secondary" className="text-xs mr-1">{p}</Badge>
                  )) : <span className="text-muted-foreground text-xs">なし</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                登録日: {new Date(member.created_at).toLocaleDateString("ja-JP")}
              </p>
              {!isSelf && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive h-7 text-xs"
                  onClick={handleRemove}
                  disabled={loading}
                >
                  <Trash2 size={12} className="mr-1" />
                  削除
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}