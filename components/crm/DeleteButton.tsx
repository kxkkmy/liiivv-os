"use client";

import { Button } from "@/components/ui/button";
import { deleteCompany, deleteSponsorship } from "@/app/actions/crm";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type Props = {
  type: "company" | "sponsorship";
  id: string;
  name?: string;
};

export function DeleteButton({ type, id, name }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const label = type === "company" ? "企業" : "協賛";
    if (!confirm(`「${name ?? label}」を削除しますか？\nこの操作は取り消せません。`)) return;
    setLoading(true);
    try {
      if (type === "company") {
        await deleteCompany(id);
      } else {
        await deleteSponsorship(id);
      }
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 w-7 text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 size={12} />
    </Button>
  );
}