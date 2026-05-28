"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { navlinks } from "@/lib/constants";
import { ThemeToggleButton } from "./ThemeToggleButton";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden cursor-pointer p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-200 md:hidden ">
          <div
            className="absolute inset-0 dark:bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-background border-l border-border p-6 shadow-2xl">
            <div className="flex justify-end mb-8">
              <button
                onClick={() => setOpen(false)}
                className="cursor-pointer p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="bg-blue-100 flex flex-col gap-4 dark:bg-black dark:text-white p-5 rounded-lg">
              {navlinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.link}
                  onClick={() => setOpen(false)}
                  className="text-foreground font-medium text-lg px-4 py-3 rounded-xl hover:bg-muted transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="self-end">
                <ThemeToggleButton />
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
