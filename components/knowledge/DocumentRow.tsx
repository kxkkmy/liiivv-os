"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentDialog } from "./DocumentDialog";
import { deleteDocument } from "@/app/actions/knowledge";
import { FileText, BookOpen, Layout, Briefcase, ExternalLink, Pencil, Trash2 } from "lucide-react";

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

type Doc = {
  id: string;
  title: string;
  doc_type: string;
  body?: string;
  url?: string;
  tags?: string[];
  updated_at: string;
};

export function DocumentRow({ doc, projectId }: { doc: Doc; projectId: string }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const Icon = docTypeIcon[doc.doc_type] ?? FileText;

  async function handleDelete() {
    if (!confirm("このドキュメントを削除しますか？")) return;
    await deleteDocument(doc.id);
  }

  return (
    <>
      <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setDetailOpen(true)}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Icon size={14} className="text-muted-foreground shrink-0" />
            <span className="font-medium">{doc.title}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-muted-foreground">{docTypeLabel[doc.doc_type] ?? "—"}</td>
        <td className="px-4 py-3">
          <div className="flex gap-1 flex-wrap">
            {doc.tags?.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          {doc.url ? (
            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ExternalLink size={12} />
              開く
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>
        <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(doc.updated_at).toLocaleDateString("ja-JP")}</td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-1">
            <DocumentDialog projectId={projectId} doc={doc} trigger={
              <Button size="icon" variant="ghost" className="h-7 w-7"><Pencil size={12} /></Button>
            } />
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 size={12} />
            </Button>
          </div>
        </td>
      </tr>
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{doc.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{docTypeLabel[doc.doc_type]}</Badge>
              {doc.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
            {doc.url && (
              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                <p className="text-xs text-muted-foreground">リンク</p>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-1 hover:underline break-all">
                  <ExternalLink size={12} className="shrink-0" />
                  {doc.url}
                </a>
              </div>
            )}
            {doc.body && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">内容</p>
                <div className="text-sm whitespace-pre-wrap bg-muted/30 rounded-lg p-3">{doc.body}</div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">更新日: {new Date(doc.updated_at).toLocaleDateString("ja-JP")}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
