"use client";

import {
  Home,
  BarChart3,
  FileText,
  Settings,
  PanelLeftClose,
  PanelLeft,
  History,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, SignOutButton, Show } from "@clerk/nextjs";
import Image from "next/image";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { useEffect } from "react";

const navItems = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { name: "History", icon: History, href: "/dashboard/history" },
  { name: "Statements", icon: FileText, href: "/dashboard/statements" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onMobileClose();
  }, [pathname]);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onMobileClose}
      />

      {/* Sidebar - fixed on all sizes, drawer on mobile, fixed on desktop */}
      <aside
        className={`fixed left-0 top-0 h-dvh bg-sidebar-background border-r border-sidebar-background/80 flex flex-col overflow-y-auto transition-all duration-300 z-50 ${
          collapsed ? "w-16" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className={`shrink-0 border-b border-sidebar-background/80 ${collapsed ? "p-3" : "p-6"}`}>
          <div className={`flex items-center justify-between ${collapsed ? "flex-col" : ""}`}>
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} mb-4`}>
              <Image
                src="/logo.svg"
                width={collapsed ? 32 : 60}
                height={collapsed ? 32 : 60}
                className="object-cover rounded-full shrink-0"
                alt="logo"
              />
              {!collapsed && (
                <div className="flex flex-col gap-2 truncate">
                  <h3 className="text-sidebar-foreground font-semibold text-sm">
                    Financialo
                  </h3>
                  <p className="text-sidebar-foreground/60 text-xs">AI Bank Statement Analyser</p>
                </div>
              )}
            </div>
            <button
              onClick={onMobileClose}
              className="md:hidden self-start p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                className={`w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors ${collapsed ? "text-xs px-1" : ""}`}
              >
                {collapsed ? ">" : "Sign In"}
              </button>
            </SignInButton>
          </Show>
        </div>

        <nav className={`flex-1 space-y-1 ${collapsed ? "p-2" : "p-4"}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center rounded-lg transition-all duration-200 ${
                  collapsed
                    ? "justify-center px-2 py-3"
                    : "gap-3 px-4 py-3"
                } ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-background/50 hover:text-sidebar-foreground"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={`shrink-0 border-t border-sidebar-background/80 ${collapsed ? "p-2" : "p-4"}`}>
          <div className={`flex items-center ${collapsed ? "justify-center flex-col gap-3" : "justify-center gap-8 pt-8"}`}>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: collapsed ? "size-8" : "size-12 ring-2 ring-primary/50 hover:ring-primary transition-all",
                  userButtonPopoverCard: "bg-background shadow-lg border-border",
                  userButtonPopoverActionButton: "text-foreground hover:bg-muted",
                  userButtonPopoverActionButtonText: "text-foreground",
                  userButtonPopoverFooter: "bg-muted",
                  userButtonTrigger: collapsed ? "scale-100" : "scale-125",
                },
              }}
            />
            <ThemeToggleButton />
            <button
              onClick={onToggle}
              className="hidden md:flex items-center rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-background/50 hover:text-sidebar-foreground transition-all duration-200"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeft className="size-5" /> : <PanelLeftClose className="size-8 shrink-0" />}
            </button>
          </div>
          <Show when="signed-out">
            <SignOutButton>
              <button
                className={`flex items-center rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-background/50 hover:text-sidebar-foreground transition-all duration-200 w-full ${
                  collapsed ? "justify-center p-2" : "gap-3 px-4 py-3"
                }`}
                title={collapsed ? "Sign Out" : undefined}
              >
                <Settings className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
              </button>
            </SignOutButton>
          </Show>
        </div>
      </aside>
    </>
  );
}
