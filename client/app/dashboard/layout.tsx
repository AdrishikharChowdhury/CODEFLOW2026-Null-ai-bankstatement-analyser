"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import Chatbot from "@/components/Chatbot";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const hideChat = pathname === "/dashboard" || pathname === "/dashboard/statements" || pathname==="/dashboard/settings"|| pathname==="/dashboard/analytics"|| pathname==="/dashboard/history" ;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ${
          collapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        <div className="md:hidden flex items-center gap-3 p-4 border-b border-border bg-background sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="size-6" />
          </button>
          <span className="text-lg font-semibold text-foreground">Financialo</span>
        </div>
        <div className="p-4 md:p-8">{children}</div>
        {!hideChat && <Chatbot />}
      </div>
    </div>
  );
}
