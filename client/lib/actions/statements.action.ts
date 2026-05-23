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

  return { success: true, url: publicUrl.publicUrl };
}
