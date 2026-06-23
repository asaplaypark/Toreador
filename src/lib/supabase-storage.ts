import { createClient } from "@supabase/supabase-js";

export type UploadBucket = "avatars" | "news-covers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getExt(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "jpg";
}

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const ext = getExt(file.name);
  const filename = `${userId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filename, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(`Avatar upload failed: ${error.message}`);

  const { data } = supabase.storage.from("avatars").getPublicUrl(filename);
  return data.publicUrl;
}

export async function uploadNewsCover(file: File, prefix: string): Promise<string> {
  const ext = getExt(file.name);
  const filename = `${prefix}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("news-covers")
    .upload(filename, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(`News cover upload failed: ${error.message}`);

  const { data } = supabase.storage.from("news-covers").getPublicUrl(filename);
  return data.publicUrl;
}

/** Delete a file by its relative path inside the bucket (just the filename, not the full URL). */
export async function deleteFile(bucket: UploadBucket, path: string): Promise<void> {
  await supabase.storage.from(bucket).remove([path]);
}

/** Extract the relative file path from a Supabase public URL. */
export function pathFromPublicUrl(url: string): string {
  return url.split("/").pop() ?? "";
}
