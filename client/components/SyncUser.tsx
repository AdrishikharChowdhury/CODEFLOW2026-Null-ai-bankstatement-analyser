"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { syncUser } from "@/lib/actions/users.action";
import posthog from "posthog-js";

export default function SyncUser() {
  const { isSignedIn, isLoaded, user } = useUser();
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      syncUser();
      posthog.identify(user.id, {
        email: user.emailAddresses[0]?.emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
      });
    }
  }, [isLoaded, isSignedIn, user]);
  return null;
}
