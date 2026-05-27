"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggleButton() {
  const { toggleTheme, theme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="cursor-pointer p-2 border border-primary text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors rounded-full"
    >
      {theme === "dark" ? <Sun className="size-5 rounded-full" /> : <Moon className="size-5 rounded-full" />}
    </button>
  );
}
