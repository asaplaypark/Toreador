import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-sepia-pale/60 bg-sepia-cream">
        <div className="mx-auto flex h-10 max-w-6xl items-center gap-1 px-4 sm:px-6">
          <Link
            href="/admin"
            className="rounded px-3 py-1 text-xs font-medium text-sepia transition-colors hover:bg-sepia-pale/40"
          >
            ภาพรวม
          </Link>
          <Link
            href="/admin/members"
            className="rounded px-3 py-1 text-xs font-medium text-sepia transition-colors hover:bg-sepia-pale/40"
          >
            จัดการสมาชิก
          </Link>
          <Link
            href="/admin/news"
            className="rounded px-3 py-1 text-xs font-medium text-sepia transition-colors hover:bg-sepia-pale/40"
          >
            ข่าวสาร
          </Link>
          <Link
            href="/admin/activities"
            className="rounded px-3 py-1 text-xs font-medium text-sepia transition-colors hover:bg-sepia-pale/40"
          >
            กิจกรรม
          </Link>
          <Link
            href="/admin/settings"
            className="rounded px-3 py-1 text-xs font-medium text-sepia transition-colors hover:bg-sepia-pale/40"
          >
            การตั้งค่า
          </Link>
          <Link
            href="/admin/donations"
            className="rounded px-3 py-1 text-xs font-medium text-sepia transition-colors hover:bg-sepia-pale/40"
          >
            บริจาค
          </Link>
          <Link
            href="/admin/import"
            className="rounded px-3 py-1 text-xs font-medium text-sepia transition-colors hover:bg-sepia-pale/40"
          >
            นำเข้าสมาชิก
          </Link>
          <Link
            href="/admin/email-preview"
            className="rounded px-3 py-1 text-xs font-medium text-sepia transition-colors hover:bg-sepia-pale/40"
          >
            Email Preview
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
