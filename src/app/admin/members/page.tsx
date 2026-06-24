import { prisma } from "@/lib/prisma";
import { MemberStatus, Prisma } from "@prisma/client";
import { getDeptLabel, getGeneration } from "@/lib/departments";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import MemberStatusActions from "./MemberStatusActions";
import MemberStatusFilter from "./MemberStatusFilter";

const STATUS_LABELS: Record<MemberStatus, string> = {
  PENDING: "รอการอนุมัติ",
  ACTIVE: "สมาชิก",
  INACTIVE: "ระงับชั่วคราว",
  REJECTED: "ปฏิเสธ",
};

function StatusBadge({ status }: { status: MemberStatus }) {
  if (status === MemberStatus.ACTIVE)
    return <Badge>{STATUS_LABELS[status]}</Badge>;
  if (status === MemberStatus.REJECTED)
    return <Badge variant="destructive">{STATUS_LABELS[status]}</Badge>;
  if (status === MemberStatus.INACTIVE)
    return <Badge variant="outline">{STATUS_LABELS[status]}</Badge>;
  // PENDING
  return (
    <Badge variant="outline" className="border-amber-400 text-amber-700">
      {STATUS_LABELS[status]}
    </Badge>
  );
}

type SearchParams = { status?: string };

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { status } = await searchParams;

  const where: Prisma.MemberWhereInput = {
    deletedAt: null,
    ...(status && (Object.values(MemberStatus) as string[]).includes(status)
      ? { status: status as MemberStatus }
      : {}),
  };

  const members = await prisma.member.findMany({
    where,
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">จัดการสมาชิก</h1>
          <p className="mt-1 text-sm text-muted-foreground">{members.length} รายการ</p>
        </div>

        <MemberStatusFilter current={status ?? ""} />

        <div className="overflow-x-auto rounded-lg border border-sepia-pale/60 bg-white">
          {members.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              ไม่พบข้อมูลสมาชิก
            </p>
          ) : (
            <table className="min-w-[640px] w-full text-sm">
              <thead className="border-b border-sepia-pale/60 bg-sepia-cream/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-sepia-mid">ชื่อ</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-sepia-mid sm:table-cell">
                    ภาควิชา / รุ่น
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-sepia-mid md:table-cell">
                    อีเมล
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sepia-mid">สถานะ</th>
                  <th className="px-4 py-3 text-right font-medium text-sepia-mid">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sepia-pale/40">
                {members.map((member) => (
                  <tr key={member.id} className="transition-colors hover:bg-sepia-bg/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/members/${member.id}`}
                        className="font-medium text-charcoal underline-offset-4 hover:text-sepia hover:underline"
                      >
                        {member.firstNameTh} {member.lastNameTh}
                        {member.nickname && (
                          <span className="ml-1 font-normal text-muted-foreground">({member.nickname})</span>
                        )}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {getDeptLabel(member.department)} · รุ่น {getGeneration(member.yearOfEntry)}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {member.user.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={member.status} />
                    </td>
                    <td className="px-4 py-3">
                      <MemberStatusActions
                        memberId={member.id}
                        currentStatus={member.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
