import { createClient } from "@supabase/supabase-js";

export type UploadBucket = "avatars" | "news-covers" | "donation-slips";

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

// ─── Donation slips (private bucket) ────────────────────────────────────────

export async function ensureDonationSlipsBucket(): Promise<void> {
  const { error } = await supabase.storage.createBucket("donation-slips", {
    public: false,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  // Ignore "already exists" error
  if (error && !error.message.includes("already exists")) {
    console.error("ensureDonationSlipsBucket:", error.message);
  }
}

export async function uploadDonationSlip(file: File, donationId: string): Promise<string> {
  await ensureDonationSlipsBucket();
  const ext = getExt(file.name);
  const path = `${donationId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("donation-slips")
    .upload(path, file, { contentType: file.type });

  if (error) throw new Error(`Slip upload failed: ${error.message}`);
  return path;
}

/** Returns a signed URL valid for 1 hour so admins can view the slip. */
export async function getDonationSlipUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("donation-slips")
    .createSignedUrl(path, 3600);

  if (error || !data) throw new Error(`Cannot get signed URL: ${error?.message}`);
  return data.signedUrl;
}
