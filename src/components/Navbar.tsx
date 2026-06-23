import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="navbar-root sticky top-0 z-50 w-full shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          TOREADOR
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/members" className="navbar-link">
            ทำเนียบสมาชิก
          </Link>

          {session?.user ? (
            <>
              <Link href="/dashboard" className="navbar-link">
                แดชบอร์ด
              </Link>
              <div className="ml-1">
                <LogoutButton />
              </div>
            </>
          ) : (
            <Link href="/login" className="navbar-cta">
              เข้าสู่ระบบ
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
