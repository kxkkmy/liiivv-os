import { createClient } from "@/lib/supabase/server";
import { MemberCard } from "@/components/management/MemberCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default async function ManagementMembersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: members } = await supabase
    .from("profiles")
    .select(`
      *,
      project_members(
        project_id,
        role,
        projects(name)
      )
    `)
    .order("created_at");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">メンバー管理</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          全メンバー · {members?.length ?? 0}名
        </p>
      </div>

      <div className="relative w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="メンバーを検索" className="pl-8 h-9" />
      </div>

      <div className="space-y-2">
        {members?.map((m) => (
          <MemberCard
            key={m.id}
            member={m as any}
            isSelf={m.id === user?.id}
          />
        ))}
      </div>
    </div>
  );
}