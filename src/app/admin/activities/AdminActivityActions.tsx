"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function AdminActivityActions({
  activityId,
  status,
}: {
  activityId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function togglePublish() {
    const newStatus = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setLoading(true);
    await fetch(`/api/admin/activities/${activityId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("ลบกิจกรรมนี้?")) return;
    setLoading(true);
    await fetch(`/api/admin/activities/${activityId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePublish}
        disabled={loading}
        className="text-xs"
      >
        {status === "PUBLISHED" ? "ซ่อน" : "เผยแพร่"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </Button>
    </>
  );
}
