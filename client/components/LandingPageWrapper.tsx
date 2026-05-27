"use client";

import type { ReactNode } from "react";

export function LandingPageWrapper({ children }: { children: ReactNode }) {
  return <div id="landing-root">{children}</div>;
}
