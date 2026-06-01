"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createBudget, createActual } from "@/app/actions/finance";
import { Plus } from "lucide-react";

type Props = {
  eventId?: string;
  type: "budget" | "actual";
  budgets?: { id: string; category: string }[];
  trigger?: React.ReactNode;
};

const categories = [
  "協賛",
  "チケット",
  "物販",
  "クラウドファンディング",
  "会場費",
  "出演者費",
  "制作費",
  "スタッフ費",
  "広告費",
  "備品費",
  "その他",
];

export function BudgetDialog({ eventId, type, budgets, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: "",
    plan_type: "revenue" as "revenue" | "expense",
    amount: "",
    budget_id: "",
    recorded_at: new Date().toISOString().split("T")[0],
    notes: "",
  });

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === "budget") {
        await createBudget({
          event_id: eventId,
          category: form.category,
          plan_type: form.plan_type,
          amount: Number(form.amount),
          notes: form.notes || undefined,
        });
      } else {
        await createActual({
          event_id: eventId,
          budget_id: form.budget_id || undefined,
          category: form.category,
          plan_type: form.plan_type,
          amount: Number(form.amount),
          recorded_at: form.recorded_at,
          notes: form.notes || undefined,
        });
      }
      setOpen(false);
      setForm({ category: "", plan_type: "revenue", amount: "", budget_id: "", recorded_at: new Date().toISOString().split("T")[0], notes: "" });
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
            {type === "budget" ? "予算追加" : "実績追加"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{type === "budget" ? "予算を追加" : "実績を追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>カテゴリ *</Label>
            <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
              <SelectTrigger><SelectValue placeholder="カテゴリを選択" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>種別 *</Label>
              <Select value={form.plan_type} onValueChange={(v) => handleChange("plan_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">収入</SelectItem>
                  <SelectItem value="expense">支出</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>金額（円）*</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="1000000"
                required
              />
            </div>
          </div>

          {type === "actual" && (
            <>
              <div className="space-y-1">
                <Label>計上日</Label>
                <Input
                  type="date"
                  value={form.recorded_at}
                  onChange={(e) => handleChange("recorded_at", e.target.value)}
                />
              </div>
              {budgets && budgets.length > 0 && (
                <div className="space-y-1">
                  <Label>対応する予算</Label>
                  <Select value={form.budget_id} onValueChange={(v) => handleChange("budget_id", v)}>
                    <SelectTrigger><SelectValue placeholder="紐付ける予算（任意）" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">紐付けない</SelectItem>
                      {budgets.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          <div className="space-y-1">
            <Label>メモ</Label>
            <Input
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="備考・メモ"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : type === "budget" ? "予算を追加" : "実績を追加"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}