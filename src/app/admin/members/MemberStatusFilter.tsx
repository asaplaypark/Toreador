"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const STATUSES = [
  { value: "", label: "ทั้งหมด" },
  { value: "PENDING", label: "รอการอนุมัติ" },
  { value: "ACTIVE", label: "สมาชิก" },
  { value: "INACTIVE", label: "ระงับชั่วคราว" },
  { value: "REJECTED", label: "ปฏิเสธ" },
];

export default function MemberStatusFilter({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((s) => (
        <Button
          key={s.value}
          size="sm"
          variant={current === s.value ? "default" : "outline"}
          onClick={() => {
            const params = new URLSearchParams();
            if (s.value) params.set("status", s.value);
            router.push(`${pathname}?${params.toString()}`);
          }}
        >
          {s.label}
        </Button>
      ))}
    </div>
  );
}
