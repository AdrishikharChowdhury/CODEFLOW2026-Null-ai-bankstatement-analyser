"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/utils/supabase";

export async function uploadStatement(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };

  const supabase = createSupabaseClient();

  const fileName = `${userId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("statements")
    .upload(fileName, file);

  if (uploadError) return { error: uploadError.message };

  const { data: publicUrl } = supabase.storage
    .from("statements")
    .getPublicUrl(fileName);

  let data;
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
  } catch (e) {
    return {
      success: true,
      url: publicUrl.publicUrl,
      data: null,
      parseError: "FastAPI unavailable",
    };
  }
  return { success: true, url: publicUrl.publicUrl, data };
}

export const getSummaries = async (userId: string) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("statements")
    .select("summary,id,created_at")
    .order("created_at", { ascending: false })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return data;
};
