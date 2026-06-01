"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DeleteFinanceButton } from "./DeleteFinanceButton";
import { ChevronDown } from "lucide-react";

type Budget = {
  id: string;
  category: string;
  plan_type: string;
  amount: number;
  notes?: string;
};

type Actual = {
  id: string;
  budget_id?: string;
  amount: number;
};

export function BudgetRow({ budget, actuals }: { budget: Budget; actuals?: Actual[] }) {
  const [expanded, setExpanded] = useState(false);
  const actualTotal = actuals?.filter((a) => a.budget_id === budget.id).reduce((s, a) => s + (a.amount ?? 0), 0) ?? 0;
  const diff = budget.plan_type === "revenue" ? actualTotal - budget.amount : budget.amount - actualTotal;

  return (
    <>
      <tr
        className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 font-medium">
          <div className="flex items-center gap-2">
            <ChevronDown size={14} className={`text-muted-foreground transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
            {budget.category}
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge variant={budget.plan_type === "revenue" ? "default" : "secondary"}>
            {budget.plan_type === "revenue" ? "収入" : "支出"}
          </Badge>
        </td>
        <td className="px-4 py-3 text-right">¥{budget.amount.toLocaleString()}</td>
        <td className="px-4 py-3 text-right">
          <span className={actualTotal > 0 ? (diff >= 0 ? "text-green-600" : "text-red-500") : "text-muted-foreground"}>
            {actualTotal > 0 ? `¥${actualTotal.toLocaleString()}` : "—"}
          </span>
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <DeleteFinanceButton type="budget" id={budget.id} name={budget.category} />
        </td>
      </tr>
      {expanded && (
        <tr className="border-b bg-muted/10">
          <td colSpan={5} className="px-8 py-3">
            <div className="space-y-2 text-sm">
              {budget.notes && (
                <div>
                  <span className="text-muted-foreground">メモ: </span>
                  {budget.notes}
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">予算額</p>
                  <p className="font-medium">¥{budget.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">実績</p>
                  <p className="font-medium">{actualTotal > 0 ? `¥${actualTotal.toLocaleString()}` : "未計上"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">差異</p>
                  <p className={`font-medium ${diff >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {actualTotal > 0 ? `${diff >= 0 ? "+" : ""}¥${diff.toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}