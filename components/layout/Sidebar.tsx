"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  BarChart2, Building2, Calendar, CheckSquare,
  BookOpen, Users, Settings, LogOut, Home,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const nav = [
  { label: "ホーム", href: "/dashboard", icon: Home },
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
  const isInProject = pathname.includes("/projects/");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      className={clsx(
        "group h-screen flex flex-col border-r bg-background transition-all duration-200 ease-in-out overflow-hidden",
        isInProject ? "w-14 hover:w-56" : "w-56"
      )}
    >
      {/* ロゴ */}
      <div className="h-14 flex items-center border-b px-4 shrink-0">
        <span className={clsx(
          "font-semibold tracking-tight text-base whitespace-nowrap transition-opacity duration-200",
          isInProject ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        )}>
          Liiivv OS
        </span>
        <span className={clsx(
          "font-semibold text-base absolute transition-opacity duration-200",
          isInProject ? "opacity-100 group-hover:opacity-0" : "opacity-0"
        )}>
          L
        </span>
      </div>

      {/* ナビ */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon size={16} className="shrink-0" />
              <span className={clsx(
                "transition-opacity duration-200",
                isInProject ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ログアウト */}
      <div className="p-2 border-t shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full transition-colors whitespace-nowrap"
        >
          <LogOut size={16} className="shrink-0" />
          <span className={clsx(
            "transition-opacity duration-200",
            isInProject ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          )}>
            ログアウト
          </span>
        </button>
      </div>
    </aside>
  );
}