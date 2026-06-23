import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle, Banknote } from "lucide-react";

export default async function AdminPage() {
  const [total, pending, active, donations] = await Promise.all([
    prisma.member.count({ where: { deletedAt: null } }),
    prisma.member.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.member.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.donation.count({ where: { status: "PENDING", deletedAt: null } }),
  ]);

  const cards = [
    {
      title: "สมาชิกทั้งหมด",
      value: total,
      Icon: Users,
      colorClass: "text-sepia",
    },
    {
      title: "รอการอนุมัติ",
      value: pending,
      Icon: Clock,
      colorClass: "text-amber-600",
    },
    {
      title: "สมาชิก ACTIVE",
      value: active,
      Icon: CheckCircle,
      colorClass: "text-green-700",
    },
    {
      title: "บริจาครอยืนยัน",
      value: donations,
      Icon: Banknote,
      colorClass: "text-sepia-mid",
    },
  ];

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">จัดการระบบ</h1>
          <p className="mt-1 text-sm text-muted-foreground">ภาพรวมระบบสมาคมฯ</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ title, value, Icon, colorClass }) => (
            <Card key={title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {title}
                </CardTitle>
                <Icon className={`size-4 ${colorClass}`} />
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-semibold ${colorClass}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
