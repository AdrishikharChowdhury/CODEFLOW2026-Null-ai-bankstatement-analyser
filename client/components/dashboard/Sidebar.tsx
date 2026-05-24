"use client";

import {
  Home,
  BarChart3,
  FileText,
  Settings,
  Wallet,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, SignOutButton, Show } from "@clerk/nextjs";
import Image from "next/image";

const navItems = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { name: "Statements", icon: FileText, href: "/dashboard/statements" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar-background border-r border-sidebar-background/80 flex flex-col">
      <div className="p-6 border-b border-sidebar-background/80">
        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/logo.svg"
            width={40}
            height={40}
            className="object-cover"
            alt="logo"
          />
          <div>
            <h3 className="text-sidebar-foreground font-semibold text-sm">
              Financialo
            </h3>
            <p className="text-sidebar-foreground/60 text-xs">Dashboard</p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center gap-3 pt-8">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-12 w-12 ring-2 ring-primary/50 hover:ring-primary transition-all",
                userButtonPopoverCard: "bg-white shadow-lg border border-gray-200",
                userButtonPopoverActionButton: "text-gray-700 hover:bg-gray-100",
                userButtonPopoverActionButtonText: "text-gray-700",
                userButtonPopoverFooter: "bg-gray-50",
                userButtonTrigger: "scale-200",
              },
            }}
          />
        </div>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Sign In
          </button>
        </SignInButton>
      </Show>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-background/50 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-background/80">
        <Show when="signed-out">
          <SignOutButton>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-background/50 hover:text-sidebar-foreground transition-all duration-200 w-full">
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </SignOutButton>
        </Show>
      </div>
    </aside>
  );
}
