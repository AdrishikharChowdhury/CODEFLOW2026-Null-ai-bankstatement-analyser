"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [light, setLight] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "light") {
        document.documentElement.classList.add("light");
        return true;
      }
    }
    return false;
  });

  const toggle = () => {
    const next = !light;
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("theme", next ? "light" : "dark");
    setLight(next);
  };

  return (
    <button
      onClick={toggle}
      className="cursor-pointer p-2 rounded-lg border border-green-pea-400 text-green-pea-200 hover:text-green-pea-50 hover:bg-green-pea-1300 transition-colors"
      title={light ? "Switch to dark mode" : "Switch to light mode"}
    >
      {light ? <Moon className="size-5" /> : <Sun className="size-5" />}
    </button>
  );
}
