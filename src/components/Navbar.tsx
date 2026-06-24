import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSetting } from "@/lib/site-settings";
import LogoutButton from "./LogoutButton";
import MobileMenu from "./MobileMenu";

export default async function Navbar() {
  const [session, siteName] = await Promise.all([
    getServerSession(authOptions),
    getSetting("site_name", "TOREADOR"),
  ]);
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  return (
    <header className="navbar-root sticky top-0 z-50 w-full shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="navbar-logo"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <Image
            src="/logo.jpg"
            alt="Toreador logo"
            height={36}
            width={36}
            className="rounded-full object-cover"
            style={{ width: "auto", height: "36px" }}
          />
          {siteName}
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden items-center gap-1 sm:flex sm:gap-2">
          <Link href="/news" className="navbar-link">ข่าวสาร</Link>
          <Link href="/activities" className="navbar-link">กิจกรรม</Link>
          <Link href="/members" className="navbar-link">ทำเนียบสมาชิก</Link>

          {session?.user ? (
            <>
              <Link href="/dashboard" className="navbar-link">แดชบอร์ด</Link>
              {isAdmin && (
                <Link href="/admin" className="navbar-link">จัดการระบบ</Link>
              )}
              <div className="ml-1">
                <LogoutButton />
              </div>
            </>
          ) : (
            <Link href="/login" className="navbar-cta">เข้าสู่ระบบ</Link>
          )}
        </nav>

        {/* Mobile hamburger — visible only on mobile */}
        <MobileMenu
          isLoggedIn={!!session?.user}
          role={session?.user?.role}
        />
      </div>
    </header>
  );
}
