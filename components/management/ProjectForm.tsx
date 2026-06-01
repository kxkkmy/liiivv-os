"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProject } from "@/app/actions/projects";

export function ProjectForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "layers",
    join_password: "",
  });

  function handleChange(key: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // name変更時にslugを自動生成
      if (key === "name") {
        next.slug = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createProject(form);
    } catch (e: any) {
      alert(e.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>プロジェクト名 *</Label>
          <Input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="例：CHAPTER18"
            required
          />
        </div>
        <div className="space-y-1">
          <Label>スラッグ（URL）*</Label>
          <Input
            value={form.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            placeholder="例：chapter18"
            required
          />
          <p className="text-xs text-muted-foreground">/projects/{form.slug || "..."}</p>
        </div>
      </div>

      <div className="space-y-1">
        <Label>説明</Label>
        <Input
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="プロジェクトの概要"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>アイコン</Label>
          <Select value={form.icon} onValueChange={(v) => handleChange("icon", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">カレンダー</SelectItem>
              <SelectItem value="layers">レイヤー</SelectItem>
              <SelectItem value="building">ビル</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>参加パスワード *</Label>
          <Input
            value={form.join_password}
            onChange={(e) => handleChange("join_password", e.target.value)}
            placeholder="例：PROJECT-2027"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "作成中..." : "プロジェクトを作成"}
        </Button>
      </div>
    </form>
  );
}