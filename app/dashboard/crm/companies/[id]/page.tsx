import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Globe, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const typeLabel: Record<string, string> = {
  sponsor: "スポンサー",
  media: "メディア",
  government: "自治体",
  school: "学校",
  ngo: "団体",
  other: "その他",
};

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("crm_companies")
    .select("*")
    .eq("id", id)
    .single();

  if (!company) notFound();

  const { data: contacts } = await supabase
    .from("crm_contacts")
    .select("*")
    .eq("company_id", id);

  const { data: deals } = await supabase
    .from("crm_deals")
    .select("*")
    .eq("company_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/crm/companies">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{company.name}</h1>
            <Badge variant="outline">{typeLabel[company.company_type] ?? company.company_type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {company.industry ?? "—"} · 更新日: {new Date(company.updated_at).toLocaleDateString("ja-JP")}
          </p>
        </div>
        <Link href={`/dashboard/crm/companies/${id}/edit`}>
          <Button size="sm" variant="outline">編集</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* 基本情報 */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-base">基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {company.prefecture && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={14} />
                {company.prefecture}{company.address ? `・${company.address}` : ""}
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} />
                {company.phone}
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe size={14} />
                <a href={company.website} target="_blank" className="underline hover:text-foreground">
                  {company.website}
                </a>
              </div>
            )}
            {company.notes && (
              <div className="pt-2 border-t text-muted-foreground">{company.notes}</div>
            )}
          </CardContent>
        </Card>

        {/* ステータス */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ステータス</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">取引状況</span>
              <Badge variant={company.status === "active" ? "default" : "secondary"}>
                {company.status === "active" ? "取引中" : company.status === "prospect" ? "見込み" : "非アクティブ"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">担当者数</span>
              <span>{contacts?.length ?? 0}名</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">商談数</span>
              <span>{deals?.length ?? 0}件</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 担当者 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">担当者</CardTitle>
          <Button size="sm" variant="outline">+ 追加</Button>
        </CardHeader>
        <CardContent>
          {contacts?.length === 0 ? (
            <p className="text-sm text-muted-foreground">担当者が登録されていません</p>
          ) : (
            <div className="space-y-2">
              {contacts?.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-muted-foreground">{c.title} {c.department}</div>
                  </div>
                  <div className="text-muted-foreground">{c.email}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 商談履歴 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">商談履歴</CardTitle>
          <Button size="sm" variant="outline">+ 追加</Button>
        </CardHeader>
        <CardContent>
          {deals?.length === 0 ? (
            <p className="text-sm text-muted-foreground">商談が登録されていません</p>
          ) : (
            <div className="space-y-2">
              {deals?.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{d.title}</div>
                    <div className="text-muted-foreground">{d.stage}</div>
                  </div>
                  <div className="font-medium">
                    {d.amount ? `¥${d.amount.toLocaleString()}` : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}