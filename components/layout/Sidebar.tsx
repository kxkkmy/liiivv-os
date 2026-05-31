"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Building2, Calendar, CheckSquare, BookOpen,
  BarChart2, Users, Settings, LogOut
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const nav = [
  { label: "ホーム", href: "/dashboard", icon: BarChart2 },
  { label: "CRM", href: "/dashboard/crm/companies", icon: Building2 },
  { label: "イベント", href: "/dashboard/events", icon: Calendar },
  { label: "タスク", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "ナレッジ", href: "/dashboard/knowledge", icon: BookOpen },
  { label: "Finance", href: "/dashboard/finance", icon: BarChart2 },
  { label: "メンバー", href: "/dashboard/settings/members", icon: Users },
  { label: "設定", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="w-56 shrink-0 h-screen flex flex-col border-r bg-background">
      <div className="h-14 flex items-center px-5 border-b">
        <span className="font-semibold tracking-tight text-base">Liiivv OS</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full transition-colors"
        >
          <LogOut size={16} />
          ログアウト
        </button>
      </div>
    </aside>
  );
}