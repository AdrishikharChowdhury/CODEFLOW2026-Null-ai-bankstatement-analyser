"use client";

import { useEffect, useRef } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggleButton() {
  const initialized = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem("landing-theme");
    if (stored !== "light") {
      document.getElementById("landing-root")?.classList.add("dark");
    }
    initialized.current = true;
  }, []);

  const toggle = () => {
    const el = document.getElementById("landing-root");
    if (!el) return;
    el.classList.toggle("dark");
    const isDark = el.classList.contains("dark");
    localStorage.setItem("landing-theme", isDark ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="cursor-pointer p-3 rounded-xl border border-primary text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
    >
      <Sun className="size-5 hidden dark:block" />
      <Moon className="size-5 block dark:hidden" />
    </button>
  );
}
