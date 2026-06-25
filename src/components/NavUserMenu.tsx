"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ChevronDown, User, Pencil, LogOut } from "lucide-react";

type Props = {
  displayName: string;
  memberId: string;
};

export default function NavUserMenu({ displayName, memberId }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative ml-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-sepia-pale transition-colors hover:bg-white/10 hover:text-white"
      >
        <span className="max-w-[120px] truncate">{displayName}</span>
        <ChevronDown className={`size-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1.5 w-48 overflow-hidden rounded-lg shadow-xl"
          style={{ backgroundColor: "var(--sepia-dark)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <Link
            href={`/members/${memberId}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-sepia-pale transition-colors hover:bg-white/10 hover:text-white"
          >
            <User className="size-3.5 shrink-0" />
            โปรไฟล์ของฉัน
          </Link>
          <Link
            href="/profile/edit"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-sepia-pale transition-colors hover:bg-white/10 hover:text-white"
          >
            <Pencil className="size-3.5 shrink-0" />
            แก้ไขโปรไฟล์
          </Link>
          <div className="my-1 border-t border-white/10" />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-sepia-pale transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-3.5 shrink-0" />
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}
