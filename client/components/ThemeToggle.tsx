"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") {
      document.documentElement.classList.add("light");
      setLight(true);
    }
  }, []);

  const toggle = () => {
    const next = !light;
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("theme", next ? "light" : "dark");
    setLight(next);
  };

  return (
    <button
      onClick={toggle}
      className="cursor-pointer p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title={light ? "Switch to dark mode" : "Switch to light mode"}
    >
      {light ? <Moon className="size-5" /> : <Sun className="size-5" />}
    </button>
  );
}
