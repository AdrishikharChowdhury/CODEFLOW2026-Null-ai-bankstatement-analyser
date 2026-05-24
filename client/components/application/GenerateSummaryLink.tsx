"use client";

import Link from "next/link";
import posthog from "posthog-js";

export function GenerateSummaryLink({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={className}
      onClick={() => posthog.capture("generate_summary_clicked")}
    >
      Generate Summary
    </Link>
  );
}
