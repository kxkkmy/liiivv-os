import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ManagementSettingsPage() {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .single();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">設定</h1>
        <p className="text-sm text-muted-foreground mt-0.5">システム設定・会社情報</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">会社情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>会社名</Label>
            <Input defaultValue="Liiivv株式会社" />
          </div>
          <div className="space-y-1">
            <Label>代表者</Label>
            <Input defaultValue="神谷健介" />
          </div>
          <div className="space-y-1">
            <Label>所在地</Label>
            <Input defaultValue="岐阜県" />
          </div>
          <Button size="sm">保存する</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">セキュリティ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <div className="font-medium">2段階認証</div>
              <div className="text-muted-foreground text-xs">Google Authenticatorを使用</div>
            </div>
            <Button size="sm" variant="outline">設定する</Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium">パスワード変更</div>
              <div className="text-muted-foreground text-xs">定期的な変更を推奨</div>
            </div>
            <Button size="sm" variant="outline">変更する</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}