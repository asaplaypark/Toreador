"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

export default function SlipViewerClient({ donationId }: { donationId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/donations/${donationId}/slip`)
      .then((r) => r.json())
      .then((d: { url?: string; error?: string }) => {
        if (d.url) setUrl(d.url);
        else setError(d.error ?? "โหลดไม่ได้");
      })
      .catch(() => setError("เกิดข้อผิดพลาด"));
  }, [donationId]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!url) return <p className="text-sm text-muted-foreground">กำลังโหลด...</p>;

  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="slip"
        className="max-h-96 w-full rounded-lg border border-sepia-pale/60 object-contain bg-sepia-cream/30"
      />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-sepia hover:underline"
      >
        <ExternalLink className="size-3" />
        เปิดในแท็บใหม่
      </a>
    </div>
  );
}
