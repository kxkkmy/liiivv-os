"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createCompany, updateCompany } from "@/app/actions/crm";
import { Plus } from "lucide-react";

type Company = {
  id?: string;
  name?: string;
  name_kana?: string;
  industry?: string;
  company_type?: string;
  website?: string;
  address?: string;
  prefecture?: string;
  phone?: string;
  status?: string;
  notes?: string;
};

type Props = {
  company?: Company;
  trigger?: React.ReactNode;
};

export function CompanyDialog({ company, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: company?.name ?? "",
    name_kana: company?.name_kana ?? "",
    industry: company?.industry ?? "",
    company_type: company?.company_type ?? "other",
    website: company?.website ?? "",
    address: company?.address ?? "",
    prefecture: company?.prefecture ?? "",
    phone: company?.phone ?? "",
    notes: company?.notes ?? "",
  });

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (company?.id) {
        await updateCompany(company.id, form);
      } else {
        await createCompany(form);
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
          <Button size="sm" variant="outline">
            <Plus size={14} className="mr-1" />企業追加
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{company?.id ? "企業を編集" : "企業を追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>企業名 *</Label>
              <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="株式会社〇〇" required />
            </div>
            <div className="space-y-1">
              <Label>企業名（カナ）</Label>
              <Input value={form.name_kana} onChange={(e) => handleChange("name_kana", e.target.value)} placeholder="カブシキガイシャ〇〇" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>種別</Label>
              <Select value={form.company_type} onValueChange={(v) => handleChange("company_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sponsor">スポンサー</SelectItem>
                  <SelectItem value="media">メディア</SelectItem>
                  <SelectItem value="government">自治体</SelectItem>
                  <SelectItem value="school">学校</SelectItem>
                  <SelectItem value="ngo">団体</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>業種</Label>
              <Input value={form.industry} onChange={(e) => handleChange("industry", e.target.value)} placeholder="例：飲料・食品" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>都道府県</Label>
              <Input value={form.prefecture} onChange={(e) => handleChange("prefecture", e.target.value)} placeholder="例：岐阜県" />
            </div>
            <div className="space-y-1">
              <Label>電話番号</Label>
              <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="058-000-0000" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>住所</Label>
            <Input value={form.address} onChange={(e) => handleChange("address", e.target.value)} placeholder="岐阜県岐阜市〇〇" />
          </div>
          <div className="space-y-1">
            <Label>ウェブサイト</Label>
            <Input value={form.website} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://example.com" />
          </div>
          <div className="space-y-1">
            <Label>メモ</Label>
            <Input value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} placeholder="備考・メモ" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
            <Button type="submit" disabled={loading}>{loading ? "保存中..." : company?.id ? "更新する" : "追加する"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}