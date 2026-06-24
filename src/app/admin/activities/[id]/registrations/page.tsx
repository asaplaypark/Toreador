import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RegistrationsClient from "./RegistrationsClient";
import { DEPARTMENT_LABELS, getGeneration } from "@/lib/departments";

export default async function RegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const activity = await prisma.activity.findUnique({
    where: { id, deletedAt: null },
    select: { id: true, title: true, maxSeats: true, startDate: true },
  });
  if (!activity) notFound();

  const registrations = await prisma.activityRegistration.findMany({
    where: { activityId: id },
    include: {
      member: {
        select: {
          firstNameTh: true,
          lastNameTh: true,
          department: true,
          yearOfEntry: true,
          user: { select: { email: true, phoneNumber: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const rows = registrations.map((r) => ({
    id: r.id,
    name: r.registrantName || (r.member ? `${r.member.firstNameTh} ${r.member.lastNameTh}` : "-"),
    department: r.member ? (DEPARTMENT_LABELS[r.member.department as keyof typeof DEPARTMENT_LABELS] ?? r.member.department) : "-",
    generation: r.member?.yearOfEntry ? `รุ่น ${getGeneration(r.member.yearOfEntry)}` : "-",
    phone: r.registrantPhone || r.member?.user?.phoneNumber || "-",
    email: r.registrantEmail || r.member?.user?.email || "-",
    lineId: r.registrantLineId || "-",
    note: r.note || "-",
    registeredAt: r.createdAt.toLocaleDateString("th-TH", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    }),
    checkedIn: r.checkedIn,
    activityId: id,
  }));

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/activities">
                <ArrowLeft className="mr-1 size-4" />
                กลับ
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-medium text-charcoal">{activity.title}</h1>
              <p className="text-sm text-muted-foreground">
                ผู้จอง {rows.length}
                {activity.maxSeats ? ` / ${activity.maxSeats} ที่นั่ง` : " คน"}
              </p>
            </div>
          </div>
        </div>

        <RegistrationsClient rows={rows} activityTitle={activity.title} />
      </div>
    </div>
  );
}
