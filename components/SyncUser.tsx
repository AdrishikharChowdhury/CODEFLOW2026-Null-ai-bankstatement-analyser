"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { syncUser } from "@/lib/actions/users.action";

export default function SyncUser() {
  const { isSignedIn, isLoaded } = useUser();
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      syncUser();
    }
  }, [isLoaded, isSignedIn]);
  return null;
}
