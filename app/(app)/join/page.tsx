"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function JoinPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    // プロジェクト検索
    const { data: project } = await supabase
      .from("projects")
      .select("id, name, slug, join_password")
      .eq("join_code", joinCode.toLowerCase())
      .single();

    if (!project) {
      setError("プロジェクトが見つかりません");
      setLoading(false);
      return;
    }

    if (project.join_password !== joinPassword) {
      setError("参加パスワードが正しくありません");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // すでに参加済みか確認
    const { data: existing } = await supabase
      .from("project_members")
      .select("id")
      .eq("project_id", project.id)
      .eq("profile_id", user.id)
      .single();

    if (existing) {
      router.push(`/projects/${project.slug}`);
      return;
    }

    // プロジェクトに参加
    const { error: joinError } = await supabase
      .from("project_members")
      .insert([{
        project_id: project.id,
        profile_id: user.id,
        role: "member",
      }]);

    if (joinError) {
      setError("参加に失敗しました");
      setLoading(false);
      return;
    }

    router.push(`/projects/${project.slug}`);
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <div className="text-2xl font-semibold tracking-tight mb-1">プロジェクト参加</div>
          <p className="text-sm text-muted-foreground">参加コードとパスワードを入力してください</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-1">
              <Label>プロジェクトコード</Label>
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="例：chapter18"
                required
              />
            </div>
            <div className="space-y-1">
              <Label>参加パスワード</Label>
              <Input
                type="password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                placeholder="管理者から発行されたパスワード"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "確認中..." : "参加する"}
            </Button>
            <Link href="/" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft size={14} />
              戻る
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}