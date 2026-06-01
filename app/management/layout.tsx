import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart2, Users, FolderOpen, Settings, ArrowLeft, Key } from "lucide-react";

const nav = [
  { label: "概要", href: "/management", icon: BarChart2 },
  { label: "メンバー管理", href: "/management/members", icon: Users },
  { label: "プロジェクト管理", href: "/management/projects", icon: FolderOpen },
  { label: "メンバーコード", href: "/management/codes", icon: Key },
  { label: "設定", href: "/management/settings", icon: Settings },
];

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!["owner", "admin"].includes(profile?.role ?? "")) {
    redirect("/");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-56 shrink-0 h-screen flex flex-col border-r bg-background">
        <div className="h-14 flex items-center gap-2 px-4 border-b">
          <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center shrink-0">
            <Settings size={14} className="text-background" />
          </div>
          <span className="font-semibold text-sm">Management</span>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {nav.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft size={15} />
            Liiivv OS へ戻る
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
        {children}
      </main>
    </div>
  );
}