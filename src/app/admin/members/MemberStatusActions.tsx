"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MemberStatus } from "@prisma/client";

export default function MemberStatusActions({
  memberId,
  currentStatus,
}: {
  memberId: string;
  currentStatus: MemberStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function changeStatus(newStatus: MemberStatus) {
    setLoading(true);
    await fetch(`/api/admin/members/${memberId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {currentStatus === MemberStatus.PENDING && (
        <>
          <Button size="sm" disabled={loading} onClick={() => changeStatus(MemberStatus.ACTIVE)}>
            อนุมัติ
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            onClick={() => changeStatus(MemberStatus.REJECTED)}
          >
            ปฏิเสธ
          </Button>
        </>
      )}
      {currentStatus === MemberStatus.ACTIVE && (
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => changeStatus(MemberStatus.INACTIVE)}
        >
          ระงับ
        </Button>
      )}
      {currentStatus === MemberStatus.INACTIVE && (
        <Button size="sm" disabled={loading} onClick={() => changeStatus(MemberStatus.ACTIVE)}>
          คืนสถานะ
        </Button>
      )}
      {currentStatus === MemberStatus.REJECTED && (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </div>
  );
}
