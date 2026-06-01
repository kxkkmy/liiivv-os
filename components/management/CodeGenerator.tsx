"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateMemberCodes, deleteMemberCode } from "@/app/actions/codes";
import { Copy, Trash2, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Code = {
  id: string;
  code: string;
  is_used: boolean;
  created_at: string;
  profiles?: { display_name: string } | null;
};

export function CodeGenerator({ codes }: { codes: Code[] }) {
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      await generateMemberCodes(count);
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("このコードを削除しますか？")) return;
    try {
      await deleteMemberCode(id);
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleCopy(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  const unused = codes.filter((c) => !c.is_used);
  const used = codes.filter((c) => c.is_used);

  return (
    <div className="space-y-6">
      {/* 発行フォーム */}
      <div className="flex items-center gap-3">
        <Input
          type="number"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-24 h-9"
        />
        <span className="text-sm text-muted-foreground">件</span>
        <Button size="sm" onClick={handleGenerate} disabled={loading}>
          <Plus size={14} className="mr-1" />
          {loading ? "発行中..." : "コードを発行"}
        </Button>
      </div>

      {/* 未使用コード */}
      {unused.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">未使用 ({unused.length}件)</h3>
          <div className="rounded-lg border bg-background overflow-hidden">
            {unused.map((c, i) => (
              <div
                key={c.id}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-muted/30 ${i !== 0 ? "border-t" : ""}`}
              >
                <span className="font-mono text-sm font-medium flex-1">{c.code}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("ja-JP")}
                </span>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleCopy(c.code)}
                  >
                    {copied === c.code ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(c.id)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用済みコード */}
      {used.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">使用済み ({used.length}件)</h3>
          <div className="rounded-lg border bg-background overflow-hidden">
            {used.map((c, i) => (
              <div
                key={c.id}
                className={`flex items-center gap-4 px-4 py-3 opacity-60 ${i !== 0 ? "border-t" : ""}`}
              >
                <span className="font-mono text-sm flex-1 line-through">{c.code}</span>
                <span className="text-xs text-muted-foreground">
                  {(c.profiles as any)?.display_name ?? "—"}
                </span>
                <Badge variant="secondary" className="text-xs">使用済み</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}