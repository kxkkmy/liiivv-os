import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Crown, Shield, User } from "lucide-react";

const roleLabel: Record<string, string> = {
  owner: "オーナー",
  manager: "マネージャー",
  member: "メンバー",
  viewer: "閲覧者",
};

const roleIcon: Record<string, any> = {
  owner: Crown,
  manager: Shield,
  member: User,
  viewer: User,
};

export default async function ProjectMembersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) notFound();

  const { data: currentMembership } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", project.id)
    .eq("profile_id", user.id)
    .single();

  const canEdit = ["owner", "manager"].includes(currentMembership?.role ?? "");

  const { data: members } = await supabase
    .from("project_members")
    .select("*, profiles(id, display_name, role, department, title)")
    .eq("project_id", project.id)
    .order("created_at");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">メンバー</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {project.name} · {members?.length ?? 0}名
          </p>
        </div>
        {canEdit && (
          <Button size="sm">
            <Plus size={14} className="mr-1" />
            メンバー追加
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {!members || members.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              メンバーが登録されていません
            </CardContent>
          </Card>
        ) : (
          members.map((m) => {
            const profile = m.profiles as any;
            const RoleIcon = roleIcon[m.role] ?? User;
            return (
              <Card key={m.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm">
                      {profile?.display_name?.[0] ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{profile?.display_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {profile?.title}{profile?.department ? ` · ${profile.department}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <RoleIcon size={12} className="text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {roleLabel[m.role]}
                    </Badge>
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