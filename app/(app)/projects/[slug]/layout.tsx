import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Home, Building2, CheckSquare, BookOpen,
  Users, BarChart2, Calendar, ArrowLeft, Settings,
} from "lucide-react";

const projectNav: Record<string, { label: string; path: string; icon: any }[]> = {
  chapter18: [
    { label: "概要", path: "", icon: Home },
    { label: "CRM", path: "/crm", icon: Building2 },
    { label: "タスク", path: "/tasks", icon: CheckSquare },
    { label: "ナレッジ", path: "/knowledge", icon: BookOpen },
    { label: "Finance", path: "/finance", icon: BarChart2 },
    { label: "スケジュール", path: "/schedule", icon: Calendar },
    { label: "メンバー", path: "/members", icon: Users },
  ],
  lystox: [
    { label: "概要", path: "", icon: Home },
    { label: "タスク", path: "/tasks", icon: CheckSquare },
    { label: "ナレッジ", path: "/knowledge", icon: BookOpen },
    { label: "Finance", path: "/finance", icon: BarChart2 },
    { label: "スケジュール", path: "/schedule", icon: Calendar },
    { label: "メンバー", path: "/members", icon: Users },
  ],
  company: [
    { label: "概要", path: "", icon: Home },
    { label: "Finance", path: "/finance", icon: BarChart2 },
    { label: "タスク", path: "/tasks", icon: CheckSquare },
    { label: "ナレッジ", path: "/knowledge", icon: BookOpen },
    { label: "メンバー", path: "/members", icon: Users },
  ],
};

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) notFound();

  // プロジェクトメンバーか確認
  const { data: membership } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", project.id)
    .eq("profile_id", user.id)
    .single();

  if (!membership) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  const isExec = ["owner", "admin"].includes(profile?.role ?? "");
  const nav = projectNav[slug] ?? projectNav.lystox;
  const base = `/projects/${slug}`;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* サイドバー */}
      <aside className="w-56 shrink-0 h-screen flex flex-col border-r bg-background">
        {/* プロジェクト名 */}
        <div className="h-14 flex items-center gap-2 px-4 border-b">
          <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center shrink-0">
            <span className="text-background text-xs font-bold">
              {project.name[0]}
            </span>
          </div>
          <span className="font-semibold text-sm truncate">{project.name}</span>
        </div>

        {/* ナビ */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {nav.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              href={`${base}${path}`}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        {/* フッター */}
        <div className="p-2 border-t space-y-0.5">
          {isExec && (
            <Link
              href="/management"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Settings size={15} />
              Management
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft size={15} />
            プロジェクト一覧
          </Link>
        </div>
      </aside>

      {/* メイン */}
      <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
        {children}
      </main>
    </div>
  );
}