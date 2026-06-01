import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeGenerator } from "@/components/management/CodeGenerator";
import { Key, Users } from "lucide-react";

export default async function ManagementCodesPage() {
  const supabase = await createClient();

  const { data: codes } = await supabase
    .from("member_codes")
    .select("*, profiles(display_name)")
    .order("created_at", { ascending: false });

  const unusedCount = codes?.filter((c) => !c.is_used).length ?? 0;
  const usedCount = codes?.filter((c) => c.is_used).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">メンバーコード管理</h1>
        <p className="text-sm text-muted-foreground mt-0.5">招待コードの発行・管理</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">未使用</CardTitle>
            <Key size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{unusedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">使用済み</CardTitle>
            <Users size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{usedCount}</div>
          </CardContent>
        </Card>
      </div>

      <CodeGenerator codes={codes ?? []} />
    </div>
  );
}