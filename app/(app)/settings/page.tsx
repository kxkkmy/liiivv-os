import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TotpSetup } from "@/components/auth/TotpSetup";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, totp_enabled")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="h-14 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <span className="font-semibold tracking-tight">設定</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* アカウント情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">アカウント情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">表示名</span>
              <span className="font-medium">{profile?.display_name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">メールアドレス</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">権限</span>
              <span className="font-medium">
                {profile?.role === "owner" ? "オーナー" :
                 profile?.role === "admin" ? "管理者" :
                 profile?.role === "manager" ? "マネージャー" : "メンバー"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* セキュリティ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">セキュリティ</CardTitle>
          </CardHeader>
          <CardContent>
            <TotpSetup
              userId={user.id}
              totpEnabled={profile?.totp_enabled ?? false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}