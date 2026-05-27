"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import Chatbot from "@/components/Chatbot";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div
        className={`flex-1 transition-all duration-300 relative ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="p-8">{children}</div>
        <Chatbot />
      </div>
    </div>
  );
}
