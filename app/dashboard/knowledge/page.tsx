import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, BookOpen, Layout, Briefcase } from "lucide-react";
import Link from "next/link";

const docTypeLabel: Record<string, string> = {
  minutes: "議事録",
  manual: "マニュアル",
  template: "テンプレート",
  case: "事例",
  other: "その他",
};

const docTypeIcon: Record<string, any> = {
  minutes: FileText,
  manual: BookOpen,
  template: Layout,
  case: Briefcase,
  other: FileText,
};

export default async function KnowledgePage() {
  const supabase = await createClient();

  const { data: docs } = await supabase
    .from("knowledge_documents")
    .select("id, title, doc_type, tags, created_at, updated_at")
    .order("updated_at", { ascending: false });

  const counts = {
    minutes: docs?.filter((d) => d.doc_type === "minutes").length ?? 0,
    manual: docs?.filter((d) => d.doc_type === "manual").length ?? 0,
    template: docs?.filter((d) => d.doc_type === "template").length ?? 0,
    case: docs?.filter((d) => d.doc_type === "case").length ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">ナレッジ管理</h1>
          <p className="text-sm text-muted-foreground mt-0.5">議事録・マニュアル・テンプレート</p>
        </div>
        <Button size="sm">
          <Plus size={14} className="mr-1" />
          ドキュメント追加
        </Button>
      </div>

      {/* カテゴリサマリー */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(counts).map(([type, count]) => {
          const Icon = docTypeIcon[type];
          return (
            <Card key={type} className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {docTypeLabel[type]}
                </CardTitle>
                <Icon size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 検索 */}
      <div className="relative w-72">
        <Input placeholder="ドキュメントを検索" className="h-9" />
      </div>

      {/* 一覧 */}
      <div className="rounded-lg border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">タイトル</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">種別</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">タグ</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">更新日</th>
            </tr>
          </thead>
          <tbody>
            {!docs || docs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-muted-foreground">
                  ドキュメントが登録されていません
                </td>
              </tr>
            ) : (
              docs.map((doc) => {
                const Icon = docTypeIcon[doc.doc_type] ?? FileText;
                return (
                  <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-muted-foreground shrink-0" />
                        <span className="font-medium">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {docTypeLabel[doc.doc_type] ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {doc.tags?.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(doc.updated_at).toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}