"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DeleteFinanceButton } from "./DeleteFinanceButton";
import { ChevronDown } from "lucide-react";

type Actual = {
  id: string;
  category: string;
  plan_type: string;
  amount: number;
  recorded_at?: string;
  notes?: string;
};

export function ActualRow({ actual }: { actual: Actual }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 font-medium">
          <div className="flex items-center gap-2">
            <ChevronDown size={14} className={`text-muted-foreground transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
            {actual.category}
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge variant={actual.plan_type === "revenue" ? "default" : "secondary"}>
            {actual.plan_type === "revenue" ? "収入" : "支出"}
          </Badge>
        </td>
        <td className="px-4 py-3 text-right font-medium">¥{actual.amount.toLocaleString()}</td>
        <td className="px-4 py-3 text-muted-foreground">
          {actual.recorded_at ? new Date(actual.recorded_at).toLocaleDateString("ja-JP") : "—"}
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <DeleteFinanceButton type="actual" id={actual.id} name={actual.category} />
        </td>
      </tr>
      {expanded && (
        <tr className="border-b bg-muted/10">
          <td colSpan={5} className="px-8 py-3">
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">金額</p>
                  <p className="font-medium">¥{actual.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">計上日</p>
                  <p className="font-medium">
                    {actual.recorded_at ? new Date(actual.recorded_at).toLocaleDateString("ja-JP") : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">種別</p>
                  <p className="font-medium">{actual.plan_type === "revenue" ? "収入" : "支出"}</p>
                </div>
              </div>
              {actual.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">メモ</p>
                  <p>{actual.notes}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}