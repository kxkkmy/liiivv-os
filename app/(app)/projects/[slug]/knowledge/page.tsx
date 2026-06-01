import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BookOpen, Layout, Briefcase } from "lucide-react";
import { DocumentDialog } from "@/components/knowledge/DocumentDialog";
import { DocumentRow } from "@/components/knowledge/DocumentRow";

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

export default async function ProjectKnowledgePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) notFound();

  const { data: docs } = await supabase
    .from("knowledge_documents")
    .select("id, title, doc_type, tags, body, url, created_at, updated_at")
    .eq("project_id_new", project.id)
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
          <h1 className="text-xl font-semibold">ナレッジ</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{project.name}の議事録・マニュアル・テンプレート</p>
        </div>
        <DocumentDialog projectId={project.id} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Object.entries(counts).map(([type, count]) => {
          const Icon = docTypeIcon[type];
          return (
            <Card key={type}>
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

      <div className="rounded-lg border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">タイトル</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">種別</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">タグ</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">リンク</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">更新日</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {!docs || docs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  ドキュメントが登録されていません
                </td>
              </tr>
            ) : (
              docs.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  projectId={project.id}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}