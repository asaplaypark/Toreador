"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Link as LinkIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export default function NewsCoverUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("รองรับเฉพาะไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    setError("");
    setUploading(true);

    // Show local preview immediately
    onChange(URL.createObjectURL(file));

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/news-cover", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? "เกิดข้อผิดพลาด");
      onChange("");
      return;
    }

    onChange(data.url);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>รูปปกข่าว</Label>
        <button
          type="button"
          onClick={() => setShowUrlInput((v) => !v)}
          className="flex items-center gap-1 text-xs text-sepia-mid hover:text-sepia transition-colors"
        >
          <LinkIcon className="size-3" />
          {showUrlInput ? "ซ่อน URL" : "ใส่ URL แทน"}
        </button>
      </div>

      {/* Upload zone */}
      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-sepia-pale/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="cover preview" className="max-h-52 w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 gap-3">
            {uploading ? (
              <Loader2 className="size-6 animate-spin text-white" />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-md bg-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30 transition-colors"
                >
                  เปลี่ยนรูป
                </button>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="rounded-md bg-white/20 p-1.5 text-white hover:bg-white/30 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 transition-colors ${
            dragOver
              ? "border-sepia bg-sepia-cream/60"
              : "border-sepia-pale/60 hover:border-sepia-light hover:bg-sepia-cream/30"
          }`}
        >
          {uploading ? (
            <Loader2 className="size-7 animate-spin text-sepia-mid" />
          ) : (
            <ImagePlus className="size-7 text-sepia-light" />
          )}
          <p className="text-sm text-muted-foreground">
            {uploading ? "กำลังอัปโหลด..." : "คลิกหรือลากรูปมาวางที่นี่"}
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG, WEBP ไม่เกิน 5MB</p>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* URL fallback */}
      {showUrlInput && (
        <Input
          placeholder="https://example.com/image.jpg"
          value={value.startsWith("blob:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
