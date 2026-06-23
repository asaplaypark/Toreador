"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";

type Props = {
  initialUrl?: string | null;
  initials: string;
  /** Called after a successful upload with the new public URL. */
  onUpload?: (url: string) => void;
};

export default function AvatarUpload({ initialUrl, initials, onUpload }: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview ?? url;

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    setPreview(URL.createObjectURL(file));
    setError("");
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/avatar", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? "เกิดข้อผิดพลาด");
      setPreview(null);
      return;
    }

    setPreview(null);
    setUrl(data.url);
    onUpload?.(data.url);

    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative shrink-0 focus:outline-none"
        aria-label="เปลี่ยนรูปโปรไฟล์"
      >
        {/* Avatar circle */}
        <div className="size-20 overflow-hidden rounded-full bg-sepia-mid">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt={initials} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="select-none text-3xl font-semibold text-sepia-cream">
                {initials.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="size-5 animate-spin text-white" />
          ) : (
            <Camera className="size-5 text-white" />
          )}
        </div>
      </button>

      <p className="text-xs text-muted-foreground">กดเพื่อเปลี่ยนรูป</p>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
