"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle } from "lucide-react";

type Row = {
  id: string;
  name: string;
  department: string;
  generation: string;
  phone: string;
  email: string;
  lineId: string;
  note: string;
  registeredAt: string;
  checkedIn: boolean;
  activityId: string;
};

export default function RegistrationsClient({
  rows,
  activityTitle,
}: {
  rows: Row[];
  activityTitle: string;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState<string | null>(null);

  function exportCsv() {
    const header = ["ชื่อ", "ภาควิชา", "รุ่น", "เบอร์โทร", "อีเมล", "LINE ID", "หมายเหตุ", "วันที่จอง", "Check-in"];
    const body = rows.map((r) => [
      r.name, r.department, r.generation, r.phone, r.email,
      r.lineId, r.note, r.registeredAt, r.checkedIn ? "✓" : "",
    ]);
    const csv = [header, ...body]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activityTitle}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCheckIn(regId: string, activityId: string) {
    setChecking(regId);
    await fetch(`/api/admin/activities/${activityId}/checkin`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId: regId }),
    });
    setChecking(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="mr-1 size-4" />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-sepia-pale/60 bg-white">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr className="border-b border-sepia-pale/40 bg-sepia-cream/60 text-left">
              <th className="px-4 py-3 font-medium text-sepia-mid">ชื่อ</th>
              <th className="px-4 py-3 font-medium text-sepia-mid">เบอร์โทร</th>
              <th className="px-4 py-3 font-medium text-sepia-mid">อีเมล</th>
              <th className="px-4 py-3 font-medium text-sepia-mid">ภาควิชา / รุ่น</th>
              <th className="px-4 py-3 font-medium text-sepia-mid">หมายเหตุ</th>
              <th className="px-4 py-3 font-medium text-sepia-mid">วันที่จอง</th>
              <th className="px-4 py-3 font-medium text-sepia-mid">Check-in</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sepia-pale/30">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  ยังไม่มีผู้จอง
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-sepia-cream/20">
                <td className="px-4 py-3 font-medium text-charcoal">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div>{r.department}</div>
                  <div className="text-xs">{r.generation}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.note !== "-" ? r.note : <span className="text-sepia-pale">—</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.registeredAt}</td>
                <td className="px-4 py-3">
                  {r.checkedIn ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="mr-1 size-3" />
                      เข้าแล้ว
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCheckIn(r.id, r.activityId)}
                      disabled={checking === r.id}
                      className="text-xs"
                    >
                      Check-in
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
