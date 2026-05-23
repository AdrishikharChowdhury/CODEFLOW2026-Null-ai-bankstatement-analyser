"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/utils/supabase";

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };
  const supabase = createSupabaseClient();
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("author", userId)
    .single();
  if (existing) return { success: true };
  
  const email = user.emailAddresses[0]?.emailAddress;

  const firstName = user.firstName;
  const lastName = user.lastName;
  const { error } = await supabase
    .from("users")
    .insert({ author: userId, email,first_name:firstName,last_name:lastName });
  if (error) return { error: error.message };
  return { success: true };
}
