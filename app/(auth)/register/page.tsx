"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    memberCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    // メンバーコード検証
    const { data: code, error: codeError } = await supabase
      .from("member_codes")
      .select("id, is_used")
      .eq("code", form.memberCode.toUpperCase())
      .single();

    if (codeError || !code) {
      setError("メンバー固有番号が正しくありません");
      setLoading(false);
      return;
    }

    if (code.is_used) {
      setError("このメンバー固有番号はすでに使用されています");
      setLoading(false);
      return;
    }

    // アカウント作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError || !authData.user) {
      setError("アカウント作成に失敗しました: " + authError?.message);
      setLoading(false);
      return;
    }

    // プロフィール作成
    await supabase.from("profiles").insert([{
      id: authData.user.id,
      display_name: form.displayName,
      role: "member",
    }]);

    // メンバーコードを使用済みに
    await supabase
      .from("member_codes")
      .update({ is_used: true, used_by: authData.user.id })
      .eq("id", code.id);

    router.push("/");
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center pb-2">
        <div className="text-2xl font-semibold tracking-tight mb-1">Liiivv OS</div>
        <p className="text-sm text-muted-foreground">新規登録</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <Label>メンバー固有番号 *</Label>
            <Input
              value={form.memberCode}
              onChange={(e) => handleChange("memberCode", e.target.value)}
              placeholder="LIIIVV-0001"
              required
            />
            <p className="text-xs text-muted-foreground">管理者から発行された番号を入力してください</p>
          </div>
          <div className="space-y-1">
            <Label>表示名 *</Label>
            <Input
              value={form.displayName}
              onChange={(e) => handleChange("displayName", e.target.value)}
              placeholder="神谷健介"
              required
            />
          </div>
          <div className="space-y-1">
            <Label>メールアドレス *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="you@liiivv.com"
              required
            />
          </div>
          <div className="space-y-1">
            <Label>パスワード *</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="8文字以上"
              minLength={8}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "登録中..." : "アカウント作成"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="underline hover:text-foreground">
              ログイン
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}