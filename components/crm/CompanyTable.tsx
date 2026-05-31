"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";

type Company = {
  id: string;
  name: string;
  company_type: string;
  prefecture: string;
  status: string;
  updated_at: string;
};

const typeLabel: Record<string, string> = {
  sponsor: "スポンサー",
  media: "メディア",
  government: "自治体",
  school: "学校",
  ngo: "団体",
  other: "その他",
};

const statusColor: Record<string, string> = {
  active: "default",
  inactive: "secondary",
  prospect: "outline",
};

export function CompanyTable({ companies }: { companies: Company[] }) {
  const [query, setQuery] = useState("");

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="企業名で検索"
            className="pl-8 h-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Link href="/dashboard/crm/companies/new">
          <Button size="sm">
            <Plus size={14} className="mr-1" />
            企業追加
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">企業名</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">種別</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">都道府県</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">ステータス</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">更新日</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  企業が登録されていません
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {typeLabel[c.company_type] ?? c.company_type}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.prefecture ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColor[c.status] as "default" | "secondary" | "outline"}>
                      {c.status === "active" ? "取引中" : c.status === "prospect" ? "見込み" : "非アクティブ"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(c.updated_at).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/crm/companies/${c.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink size={14} />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}