"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DEPARTMENT_OPTIONS } from "@/lib/departments";
import { Search, X } from "lucide-react";

const ALL_VALUE = "__all__";

export default function MemberFilters({
  search,
  department,
  generation,
}: {
  search: string;
  department: string;
  generation: string;
}) {
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

  const hasFilters = search || department || generation;

  function clearAll() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          defaultValue={search}
          placeholder="ค้นหาชื่อ, อาชีพ, ที่ทำงาน..."
          className="pl-8"
          onChange={(e) => update("search", e.target.value)}
        />
      </div>

      {/* Department filter */}
      <Select
        value={department || ALL_VALUE}
        onValueChange={(v) => update("department", v === ALL_VALUE ? "" : v)}
      >
        <SelectTrigger className="w-full sm:w-56">
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

      {/* Generation filter */}
      <div className="relative w-full sm:w-32">
        <Input
          defaultValue={generation}
          type="number"
          placeholder="รุ่นที่"
          min={1}
          onChange={(e) => update("generation", e.target.value)}
        />
      </div>

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="shrink-0"
        >
          <X className="size-4 mr-1" />
          ล้าง
        </Button>
      )}

      {isPending && (
        <span className="text-xs text-sepia-mid shrink-0">กำลังค้นหา...</span>
      )}
    </div>
  );
}
