"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    name_kana: "",
    industry: "",
    company_type: "",
    website: "",
    address: "",
    prefecture: "",
    phone: "",
    notes: "",
  });

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase
  .from("crm_companies")
  .insert([{ ...form, status: "prospect" }]);

    if (error) {
      alert("エラーが発生しました: " + error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/crm/companies");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/crm/companies">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">企業追加</h1>
          <p className="text-sm text-muted-foreground mt-0.5">新しい企業を登録する</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>企業名 *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="株式会社〇〇"
                />
              </div>
              <div className="space-y-1">
                <Label>企業名（カナ）</Label>
                <Input
                  value={form.name_kana}
                  onChange={(e) => handleChange("name_kana", e.target.value)}
                  placeholder="カブシキガイシャ〇〇"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>種別</Label>
                <Select onValueChange={(v) => handleChange("company_type", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sponsor">スポンサー</SelectItem>
                    <SelectItem value="media">メディア</SelectItem>
                    <SelectItem value="government">自治体</SelectItem>
                    <SelectItem value="school">学校</SelectItem>
                    <SelectItem value="ngo">団体</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>業種</Label>
                <Input
                  value={form.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                  placeholder="例：飲料・食品"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>都道府県</Label>
                <Input
                  value={form.prefecture}
                  onChange={(e) => handleChange("prefecture", e.target.value)}
                  placeholder="例：岐阜県"
                />
              </div>
              <div className="space-y-1">
                <Label>電話番号</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="058-000-0000"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>住所</Label>
              <Input
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="岐阜県岐阜市〇〇"
              />
            </div>

            <div className="space-y-1">
              <Label>ウェブサイト</Label>
              <Input
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-1">
              <Label>メモ</Label>
              <Input
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="備考・メモ"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Link href="/dashboard/crm/companies">
                <Button variant="outline" type="button">キャンセル</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "保存中..." : "保存する"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}