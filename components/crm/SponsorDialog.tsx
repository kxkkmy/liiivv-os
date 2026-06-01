"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createSponsorship, updateSponsorshipStatus } from "@/app/actions/crm";
import { Plus } from "lucide-react";

type Company = {
  id: string;
  name: string;
};

type Sponsorship = {
  id?: string;
  company_id?: string;
  plan_name?: string;
  amount?: number;
  proposal_status?: string;
  contract_status?: string;
  invoice_status?: string;
  notes?: string;
};

type Props = {
  companies: Company[];
  sponsorship?: Sponsorship;
  trigger?: React.ReactNode;
};

export function SponsorDialog({ companies, sponsorship, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company_id: sponsorship?.company_id ?? "",
    plan_name: sponsorship?.plan_name ?? "",
    amount: sponsorship?.amount?.toString() ?? "",
    proposal_status: sponsorship?.proposal_status ?? "draft",
    contract_status: sponsorship?.contract_status ?? "none",
    invoice_status: sponsorship?.invoice_status ?? "none",
    notes: sponsorship?.notes ?? "",
  });

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (sponsorship?.id) {
        await updateSponsorshipStatus(sponsorship.id, "proposal_status", form.proposal_status);
        await updateSponsorshipStatus(sponsorship.id, "contract_status", form.contract_status);
        await updateSponsorshipStatus(sponsorship.id, "invoice_status", form.invoice_status);
      } else {
        await createSponsorship({
          company_id: form.company_id,
          plan_name: form.plan_name,
          amount: Number(form.amount),
          notes: form.notes || undefined,
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
            <Plus size={14} className="mr-1" />協賛追加
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{sponsorship?.id ? "協賛を編集" : "協賛を追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!sponsorship?.id && (
            <>
              <div className="space-y-1">
                <Label>企業 *</Label>
                <Select value={form.company_id} onValueChange={(v) => handleChange("company_id", v)}>
                  <SelectTrigger><SelectValue placeholder="企業を選択" /></SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>プラン名 *</Label>
                  <Input value={form.plan_name} onChange={(e) => handleChange("plan_name", e.target.value)} placeholder="例：Gold" required />
                </div>
                <div className="space-y-1">
                  <Label>金額（円）*</Label>
                  <Input type="number" value={form.amount} onChange={(e) => handleChange("amount", e.target.value)} placeholder="1000000" required />
                </div>
              </div>
              <div className="space-y-1">
                <Label>メモ</Label>
                <Input value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} placeholder="備考・メモ" />
              </div>
            </>
          )}

          {sponsorship?.id && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>提案状況</Label>
                <Select value={form.proposal_status} onValueChange={(v) => handleChange("proposal_status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">下書き</SelectItem>
                    <SelectItem value="sent">送付済み</SelectItem>
                    <SelectItem value="negotiating">交渉中</SelectItem>
                    <SelectItem value="agreed">合意</SelectItem>
                    <SelectItem value="rejected">不成立</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>契約状況</Label>
                <Select value={form.contract_status} onValueChange={(v) => handleChange("contract_status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">未締結</SelectItem>
                    <SelectItem value="sent">送付済み</SelectItem>
                    <SelectItem value="signed">締結済み</SelectItem>
                    <SelectItem value="cancelled">解除</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>請求状況</Label>
                <Select value={form.invoice_status} onValueChange={(v) => handleChange("invoice_status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">未請求</SelectItem>
                    <SelectItem value="issued">請求済み</SelectItem>
                    <SelectItem value="partial">一部入金</SelectItem>
                    <SelectItem value="paid">入金済み</SelectItem>
                    <SelectItem value="overdue">延滞</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
            <Button type="submit" disabled={loading}>{loading ? "保存中..." : sponsorship?.id ? "更新する" : "追加する"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}