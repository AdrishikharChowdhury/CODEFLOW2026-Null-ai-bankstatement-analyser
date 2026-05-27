"use client";

import { SignUp } from "@clerk/nextjs";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggleButton />
      </div>
      <SignUp />
    </div>
  );
}
