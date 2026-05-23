"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("author", userId)
    .single();
  if (existing) return { success: true };
  const user = await currentUser();
  if(!user) throw new Error('Not Authorized')
  const email = user.emailAddresses[0]?.emailAddress;
  const { error } = await supabase
    .from("users")
    .insert({ author: userId, email });
  if (error) return { error: error.message };
  return { success: true };
}
