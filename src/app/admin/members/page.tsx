import { prisma } from "@/lib/prisma";
import { MemberStatus, Prisma } from "@prisma/client";
import { getDeptLabel, getGeneration } from "@/lib/departments";
import { calculateAge, isAgeValid } from "@/lib/age";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import MemberStatusActions from "./MemberStatusActions";
import MemberStatusFilter from "./MemberStatusFilter";
import Pagination from "@/components/Pagination";

const PER_PAGE = 25;

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
  return (
    <Badge variant="outline" className="border-amber-400 text-amber-700">
      {STATUS_LABELS[status]}
    </Badge>
  );
}

type SearchParams = { status?: string; page?: string };

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { status, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const where: Prisma.MemberWhereInput = {
    deletedAt: null,
    ...(status && (Object.values(MemberStatus) as string[]).includes(status)
      ? { status: status as MemberStatus }
      : {}),
  };

  const [total, members] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.findMany({
      where,
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  const paginationParams: Record<string, string> = {};
  if (status) paginationParams.status = status;

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">จัดการสมาชิก</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total === 0 ? "ไม่พบข้อมูล" : `แสดง ${from}–${to} จาก ${total} รายการ`}
          </p>
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
                  <th className="hidden px-4 py-3 text-left font-medium text-sepia-mid lg:table-cell">
                    อายุ
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
                        {(member.formerFirstName || member.formerLastName) && (
                          <span className="ml-1 font-normal text-muted-foreground text-xs">
                            เดิม: {[member.formerFirstName, member.formerLastName].filter(Boolean).join(" ")}
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {getDeptLabel(member.department)} · รุ่น {getGeneration(member.yearOfEntry)}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {(() => {
                        const age = calculateAge(member.birthDate);
                        const valid = isAgeValid(age);
                        return valid ? (
                          <span className="text-muted-foreground">{age}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 font-medium">
                            <TriangleAlert className="size-3.5 shrink-0" />
                            {age}
                          </span>
                        );
                      })()}
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

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/admin/members"
          searchParams={paginationParams}
        />
      </div>
    </div>
  );
}
