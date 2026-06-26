import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle, Banknote, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const [total, pending, active, donations] = await Promise.all([
    prisma.member.count({ where: { deletedAt: null } }),
    prisma.member.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.member.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.donation.count({ where: { status: "PENDING", deletedAt: null } }),
  ]);

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">จัดการระบบ</h1>
          <p className="mt-1 text-sm text-muted-foreground">ภาพรวมระบบสมาคมฯ</p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* สมาชิกทั้งหมด — static */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">สมาชิกทั้งหมด</CardTitle>
              <Users className="size-4 text-sepia" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-sepia">{total}</p>
            </CardContent>
          </Card>

          {/* รอการอนุมัติ — clickable */}
          <Link href="/admin/members?status=PENDING" className="group">
            <Card className="h-full cursor-pointer transition-colors group-hover:border-sepia/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">รอการอนุมัติ</CardTitle>
                <Clock className="size-4 text-amber-600" />
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <p className="text-3xl font-semibold text-amber-600">{pending}</p>
                <ArrowRight className="size-4 text-muted-foreground/40 transition-colors group-hover:text-amber-600" />
              </CardContent>
            </Card>
          </Link>

          {/* สมาชิก ACTIVE — static */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">สมาชิก ACTIVE</CardTitle>
              <CheckCircle className="size-4 text-green-700" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-green-700">{active}</p>
            </CardContent>
          </Card>

          {/* บริจาครอยืนยัน — clickable */}
          <Link href="/admin/donations?status=PENDING" className="group">
            <Card className="h-full cursor-pointer transition-colors group-hover:border-sepia/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">บริจาครอยืนยัน</CardTitle>
                <Banknote className="size-4 text-sepia-mid" />
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <p className="text-3xl font-semibold text-sepia-mid">{donations}</p>
                <ArrowRight className="size-4 text-muted-foreground/40 transition-colors group-hover:text-sepia-mid" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
