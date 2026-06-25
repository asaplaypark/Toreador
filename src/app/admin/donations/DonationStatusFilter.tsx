"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const FUNDS = [
  { value: "", label: "ทุกกองทุน" },
  { value: "KATANYU", label: "กตัญญูครูสถา" },
  { value: "STACARE", label: "สถาอาทร" },
];

const STATUSES = [
  { value: "", label: "ทุกสถานะ" },
  { value: "PENDING", label: "รอยืนยัน" },
  { value: "CONFIRMED", label: "ยืนยันแล้ว" },
  { value: "REJECTED", label: "ปฏิเสธ" },
];

export default function DonationStatusFilter({
  currentFund,
  currentStatus,
}: {
  currentFund: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function update(key: string, val: string) {
    const params = new URLSearchParams(sp.toString());
    if (val) params.set(key, val); else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const chip = "rounded-full px-3 py-1 text-xs font-medium transition-colors";
  const active = "bg-sepia-dark text-sepia-cream";
  const inactive = "bg-white border border-sepia-pale/60 text-sepia hover:bg-sepia-cream";

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex flex-wrap gap-1.5">
        {FUNDS.map((f) => (
          <button
            key={f.value}
            onClick={() => update("fund", f.value)}
            className={`${chip} ${currentFund === f.value ? active : inactive}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="h-4 w-px self-center bg-sepia-pale/60 hidden sm:block" />
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => update("status", s.value)}
            className={`${chip} ${currentStatus === s.value ? active : inactive}`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
