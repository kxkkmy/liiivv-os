"use client";

import { Button } from "@/components/ui/button";
import { deleteBudget, deleteActual } from "@/app/actions/finance";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type Props = {
  type: "budget" | "actual";
  id: string;
  name?: string;
};

export function DeleteFinanceButton({ type, id, name }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const label = type === "budget" ? "予算" : "実績";
    if (!confirm(`「${name ?? label}」を削除しますか？\nこの操作は取り消せません。`)) return;
    setLoading(true);
    try {
      if (type === "budget") {
        await deleteBudget(id);
      } else {
        await deleteActual(id);
      }
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      className="h-7 w-7 text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 size={12} />
    </Button>
  );
}