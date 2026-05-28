"use server";

import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/utils/supabase-admin";
import { createSupabaseClient } from "@/utils/supabase";
import type { ParseResponse, SummaryData } from "@/types";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function uploadStatement(formData: FormData): Promise<
  | { error: string }
  | {
      success: true;
      url: string;
      data: ParseResponse | null;
      parseError?: string;
    }
> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };

  const supabase = createAdminClient();

  const fileName = `${userId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("statements")
    .upload(fileName, file);

  if (uploadError) return { error: uploadError.message };

  const { data: publicUrl } = supabase.storage
    .from("statements")
    .getPublicUrl(fileName);

  let data: ParseResponse | null = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storage_path: fileName,
        file_name: file.name,
        file_type: file.name.endsWith(".csv") ? "csv" : "pdf",
      }),
    });
    data = await res.json();
  } catch {
    return {
      success: true,
      url: publicUrl.publicUrl,
      data: null,
      parseError: "FastAPI unavailable",
    };
  }
  return { success: true, url: publicUrl.publicUrl, data };
}

export const getSummaries = async (
  userId: string,
): Promise<
  {
    summary: SummaryData;
    id: string;
    created_at: string;
    ai_advice: string | null;
    fraud_detection: string | null;
    slug: string | null;
  }[]
> => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("statements")
    .select("summary,id,created_at,ai_advice,fraud_detection,slug")
    .order("created_at", { ascending: false })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return data as {
    summary: SummaryData;
    id: string;
    created_at: string;
    ai_advice: string | null;
    fraud_detection: string | null;
    slug: string | null;
  }[];
};

export const getSummary = async (
  userId: string,
  id: string,
): Promise<{
  summary: SummaryData;
  created_at: string;
  ai_advice: string | null;
  fraud_detection: string | null;
}> => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("statements")
    .select("summary,created_at,ai_advice,fraud_detection")
    .eq("user_id", userId)
    .eq("id", id);

  if (error) throw new Error(error.message);
  return data[0] as {
    summary: SummaryData;
    created_at: string;
    ai_advice: string | null;
    fraud_detection: string | null;
  };
};

export const saveAdvice = async (
  id: string,
  aiAdvice: string,
  fraudDetection: string,
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("statements")
    .update({ ai_advice: aiAdvice, fraud_detection: fraudDetection })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
};

export const deleteStatement = async (id: string) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("statements")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/settings");
};
