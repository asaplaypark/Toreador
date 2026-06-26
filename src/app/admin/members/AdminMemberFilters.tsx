"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENT_OPTIONS } from "@/lib/departments";
import { Search, X } from "lucide-react";

const ALL_VALUE = "__all__";

const STATUSES = [
  { value: "", label: "ทั้งหมด" },
  { value: "PENDING", label: "รอการอนุมัติ" },
  { value: "ACTIVE", label: "สมาชิก" },
  { value: "INACTIVE", label: "ระงับ" },
  { value: "REJECTED", label: "ปฏิเสธ" },
];

type Props = {
  search: string;
  status: string;
  department: string;
  studio: string;
};

export default function AdminMemberFilters({ search, status, department, studio }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const hasActiveFilters = search || status || department || studio;

  function clearAll() {
    startTransition(() => router.push(pathname));
  }

  return (
    <div className="space-y-3">
      {/* Row 1: Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          key={search}
          defaultValue={search}
          placeholder="ค้นหาชื่อ, ชื่อเล่น, อีเมล, เบอร์โทร..."
          className="pl-8"
          onChange={(e) => update("search", e.target.value)}
        />
      </div>

      {/* Row 2: Status pills + Department + Studio + Clear */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Status pills */}
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <Button
              key={s.value}
              size="sm"
              variant={status === s.value ? "default" : "outline"}
              className="h-8"
              onClick={() => update("status", s.value)}
            >
              {s.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 sm:ml-auto sm:items-center">
          {/* Department */}
          <Select
            value={department || ALL_VALUE}
            onValueChange={(v) => update("department", v === ALL_VALUE ? "" : v)}
          >
            <SelectTrigger className="h-8 w-48 text-sm">
              <SelectValue placeholder="ทุกภาควิชา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>ทุกภาควิชา</SelectItem>
              {DEPARTMENT_OPTIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Studio/generation */}
          <Input
            key={studio}
            defaultValue={studio}
            type="number"
            placeholder="รุ่นที่"
            min={1}
            className="h-8 w-24 text-sm"
            onChange={(e) => update("studio", e.target.value)}
          />

          {/* Clear */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0"
              onClick={clearAll}
            >
              <X className="mr-1 size-3.5" />
              ล้างตัวกรอง
            </Button>
          )}

          {isPending && (
            <span className="text-xs text-sepia-mid">กำลังค้นหา...</span>
          )}
        </div>
      </div>
    </div>
  );
}
