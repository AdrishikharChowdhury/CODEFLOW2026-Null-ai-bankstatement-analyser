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

  const user = await currentUser();
  if (!user) return { error: "User not found" };

  const email = user.emailAddresses[0]?.emailAddress;
  const firstName = user.firstName;
  const lastName = user.lastName;
  const { error } = await supabase
    .from("users")
    .insert({ author: userId, email, first_name: firstName, last_name: lastName });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateBudget(
  monthly: string,
  weekly: string,
  daily: string,
  yearly: string
) {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("users")
    .update({
      monthly_budget: Number(monthly),
      weekly_budget: Number(weekly),
      daily_budget: Number(daily),
      yearly_budget: Number(yearly),
    })
    .eq("author", userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function getBudget(): Promise<{
  monthly: number;
  weekly: number;
  daily: number;
  yearly: number;
} | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("users")
    .select("monthly_budget, weekly_budget, daily_budget, yearly_budget")
    .eq("author", userId)
    .single();
  if (!data) return null;
  return {
    monthly: data.monthly_budget ?? 0,
    weekly: data.weekly_budget ?? 0,
    daily: data.daily_budget ?? 0,
    yearly: data.yearly_budget ?? 0,
  };
}
