"use client";

import { SignIn } from "@clerk/nextjs";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggleButton />
      </div>
      <SignIn />
    </div>
  );
}
