import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-50 w-full bg-sepia-dark shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold tracking-[0.15em] text-white hover:text-sepia-pale transition-colors"
        >
          TOREADOR
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/members"
            className="rounded px-3 py-1.5 text-sm text-sepia-pale hover:bg-white/10 hover:text-white transition-colors"
          >
            ทำเนียบสมาชิก
          </Link>

          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded px-3 py-1.5 text-sm text-sepia-pale hover:bg-white/10 hover:text-white transition-colors"
              >
                แดชบอร์ด
              </Link>
              <div className="ml-1">
                <LogoutButton />
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="ml-1 rounded-lg bg-sepia-cream px-4 py-1.5 text-sm font-medium text-sepia hover:bg-sepia-pale transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
