"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createDocument, updateDocument } from "@/app/actions/knowledge";
import { Plus, X } from "lucide-react";

type Document = {
  id?: string;
  title?: string;
  doc_type?: string;
  body?: string;
  url?: string;
  tags?: string[];
};

type Props = {
  projectId: string;
  doc?: Document;
  trigger?: React.ReactNode;
};

const docTypeLabel: Record<string, string> = {
  minutes: "議事録",
  manual: "マニュアル",
  template: "テンプレート",
  case: "事例",
  other: "その他",
};

export function DocumentDialog({ projectId, doc, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    title: doc?.title ?? "",
    doc_type: doc?.doc_type ?? "other",
    body: doc?.body ?? "",
    url: doc?.url ?? "",
    tags: doc?.tags ?? [] as string[],
  });

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (!tag || form.tags.includes(tag)) return;
    setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (doc?.id) {
        await updateDocument(doc.id, {
          title: form.title,
          doc_type: form.doc_type,
          body: form.body,
          url: form.url || undefined,
          tags: form.tags,
        });
      } else {
        await createDocument({
          title: form.title,
          doc_type: form.doc_type,
          body: form.body,
          url: form.url || undefined,
          tags: form.tags,
          project_id_new: projectId,
        });
      }
      setOpen(false);
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus size={14} className="mr-1" />
            ドキュメント追加
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{doc?.id ? "ドキュメントを編集" : "ドキュメントを追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>タイトル *</Label>
            <Input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="ドキュメントのタイトル"
              required
            />
          </div>

          <div className="space-y-1">
            <Label>種別</Label>
            <Select value={form.doc_type} onValueChange={(v) => handleChange("doc_type", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(docTypeLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>内容</Label>
            <Textarea
              value={form.body}
              onChange={(e) => handleChange("body", e.target.value)}
              placeholder="ドキュメントの内容（Markdown対応）"
              rows={5}
            />
          </div>

          <div className="space-y-1">
            <Label>リンクURL</Label>
            <Input
              value={form.url}
              onChange={(e) => handleChange("url", e.target.value)}
              placeholder="https://..."
              type="url"
            />
            <p className="text-xs text-muted-foreground">Google Drive・Notion・外部リンクなど</p>
          </div>

          <div className="space-y-1">
            <Label>タグ</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="タグを入力してEnter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>追加</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X size={10} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : doc?.id ? "更新する" : "追加する"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}