"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";

type Props = {
  isLoggedIn: boolean;
  role?: string;
};

export default function MobileMenu({ isLoggedIn, role }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  // Close on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const linkClass =
    "block w-full px-4 py-3 text-left text-sm text-sepia-pale transition-colors hover:bg-white/10 hover:text-white";
  const dividerClass = "my-1 border-t border-white/10";

  return (
    <div className="relative sm:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
        className="flex items-center justify-center rounded-md p-2 text-white transition-colors hover:bg-white/10"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-lg shadow-xl"
          style={{ backgroundColor: "var(--sepia-dark)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <Link href="/news" className={linkClass}>ข่าวสาร</Link>
          <Link href="/activities" className={linkClass}>กิจกรรม</Link>
          <Link href="/donate" className={linkClass}>บริจาค</Link>
          <Link href="/members" className={linkClass}>ทำเนียบสมาชิก</Link>

          {isLoggedIn ? (
            <>
              <div className={dividerClass} />
              <Link href="/dashboard" className={linkClass}>แดชบอร์ด</Link>
              {isAdmin && (
                <Link href="/admin" className={linkClass}>จัดการระบบ</Link>
              )}
              <div className={dividerClass} />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className={linkClass}
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <div className={dividerClass} />
              <Link href="/login" className={`${linkClass} font-medium text-white`}>
                เข้าสู่ระบบ
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
