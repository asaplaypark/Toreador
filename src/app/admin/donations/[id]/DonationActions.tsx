"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";

export default function DonationActions({ donationId }: { donationId: string }) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handle(action: "confirm" | "reject") {
    if (action === "reject" && !rejectReason.trim()) {
      setError("กรุณาระบุเหตุผล");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/donations/${donationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectReason: rejectReason.trim() }),
      });
      const d = await res.json() as { error?: string };
      if (!res.ok) { setError(d.error ?? "เกิดข้อผิดพลาด"); }
      else { router.refresh(); }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-sepia-pale/60 bg-white p-4">
      <p className="text-sm font-medium text-charcoal">การดำเนินการ</p>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
      )}

      {rejecting ? (
        <div className="space-y-2">
          <Textarea
            placeholder="ระบุเหตุผลที่ปฏิเสธ..."
            rows={2}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={loading}
              onClick={() => void handle("reject")}
            >
              <XCircle className="mr-1.5 size-3.5" />
              {loading ? "กำลังดำเนินการ..." : "ยืนยันการปฏิเสธ"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRejecting(false)}>ยกเลิก</Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-green-700 hover:bg-green-800 text-white gap-1.5"
            disabled={loading}
            onClick={() => void handle("confirm")}
          >
            <CheckCircle className="size-3.5" />
            {loading ? "กำลังยืนยัน..." : "ยืนยันการบริจาค"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/5 gap-1.5"
            onClick={() => setRejecting(true)}
          >
            <XCircle className="size-3.5" />
            ปฏิเสธ
          </Button>
        </div>
      )}
    </div>
  );
}
