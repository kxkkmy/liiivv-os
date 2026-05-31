"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  user?: {
    display_name: string;
    role: string;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="h-14 border-b flex items-center justify-between px-6 bg-background">
      <div />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Bell size={18} />
        </Button>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {user?.display_name?.[0] ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div className="font-medium leading-none">{user?.display_name ?? "---"}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{user?.role ?? ""}</div>
          </div>
        </div>
      </div>
    </header>
  );
}