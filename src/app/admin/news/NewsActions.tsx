"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NewsStatus } from "@prisma/client";
import Link from "next/link";

export default function NewsActions({
  newsId,
  currentStatus,
}: {
  newsId: string;
  currentStatus: NewsStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(status: NewsStatus) {
    setLoading(true);
    await fetch(`/api/admin/news/${newsId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  async function deleteNews() {
    if (!confirm("ต้องการลบข่าวนี้ใช่หรือไม่?")) return;
    setLoading(true);
    await fetch(`/api/admin/news/${newsId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button size="sm" variant="outline" asChild>
        <Link href={`/admin/news/${newsId}/edit`}>แก้ไข</Link>
      </Button>

      {currentStatus === NewsStatus.DRAFT && (
        <Button size="sm" disabled={loading} onClick={() => setStatus(NewsStatus.PUBLISHED)}>
          เผยแพร่
        </Button>
      )}
      {currentStatus === NewsStatus.PUBLISHED && (
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => setStatus(NewsStatus.DRAFT)}
        >
          ยกเลิกเผยแพร่
        </Button>
      )}
      {currentStatus === NewsStatus.ARCHIVED && (
        <Button size="sm" disabled={loading} onClick={() => setStatus(NewsStatus.PUBLISHED)}>
          เผยแพร่อีกครั้ง
        </Button>
      )}

      <Button
        size="sm"
        variant="outline"
        disabled={loading}
        className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
        onClick={deleteNews}
      >
        ลบ
      </Button>
    </div>
  );
}
