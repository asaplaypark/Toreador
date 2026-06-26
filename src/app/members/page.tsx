import { Suspense } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDeptLabel, getGeneration } from "@/lib/departments";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import MemberFilters from "./MemberFilters";
import { Department, MemberStatus, Prisma } from "@prisma/client";
import { Briefcase, Building2, Users } from "lucide-react";
import Avatar from "@/components/Avatar";
import Pagination from "@/components/Pagination";

const PER_PAGE = 20;

type SearchParams = {
  search?: string;
  department?: string;
  generation?: string;
  page?: string;
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;

  const search = params.search?.trim() ?? "";
  const department = params.department ?? "";
  const generationStr = params.generation ?? "";
  const yearOfEntry = generationStr ? 2475 + parseInt(generationStr, 10) : undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const where: Prisma.MemberWhereInput = {
    status: MemberStatus.ACTIVE,
    deletedAt: null,
    ...(department && Object.values(Department).includes(department as Department)
      ? { department: department as Department }
      : {}),
    ...(yearOfEntry ? { yearOfEntry } : {}),
    ...(search
      ? {
          OR: [
            { firstNameTh: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { lastNameTh: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { firstNameEn: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { lastNameEn: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ...(isLoggedIn
              ? [
                  { occupation: { contains: search, mode: Prisma.QueryMode.insensitive } },
                  { workplace: { contains: search, mode: Prisma.QueryMode.insensitive } },
                ]
              : []),
          ],
        }
      : {}),
  };

  const [total, members] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.findMany({
      where,
      select: {
        id: true,
        firstNameTh: true,
        lastNameTh: true,
        nickname: true,
        formerFirstName: true,
        formerLastName: true,
        department: true,
        yearOfEntry: true,
        occupation: true,
        workplace: true,
        profilePhoto: true,
      },
      orderBy: [{ yearOfEntry: "asc" }, { firstNameTh: "asc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  // searchParams without page for Pagination component
  const paginationParams: Record<string, string> = {};
  if (search) paginationParams.search = search;
  if (department) paginationParams.department = department;
  if (generationStr) paginationParams.generation = generationStr;

  return (
    <div className="flex-1 bg-sepia-bg">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-2xl font-medium tracking-tight flex items-center gap-2 text-charcoal">
              <Users className="size-6 text-sepia-mid" />
              ทำเนียบสมาชิก
            </h1>
            <p className="text-sm text-muted-foreground">
              {total === 0 ? (
                "ไม่พบสมาชิก"
              ) : (
                <>
                  แสดง{" "}
                  <span className="font-medium text-foreground">
                    {from}–{to}
                  </span>{" "}
                  จาก{" "}
                  <span className="font-medium text-foreground">{total}</span>{" "}
                  รายการ
                </>
              )}
              {!isLoggedIn && (
                <span className="ml-1">
                  —{" "}
                  <Link
                    href="/login"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    เข้าสู่ระบบ
                  </Link>{" "}
                  เพื่อดูข้อมูลเพิ่มเติม
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Suspense fallback={null}>
          <MemberFilters
            search={search}
            department={department}
            generation={generationStr}
          />
        </Suspense>

        {/* Grid */}
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-sepia-mid">
            <Users className="size-10 mb-3 opacity-30" />
            <p>ไม่พบสมาชิกที่ตรงกับเงื่อนไข</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => {
                const gen = getGeneration(member.yearOfEntry);
                const dept = getDeptLabel(member.department);
                const baseName = `${member.firstNameTh} ${member.lastNameTh}`;
                const formerPart = (member.formerFirstName || member.formerLastName)
                  ? ` (เดิม: ${[member.formerFirstName, member.formerLastName].filter(Boolean).join(" ")})`
                  : "";
                const fullName = member.nickname
                  ? `${baseName} (${member.nickname})${formerPart}`
                  : `${baseName}${formerPart}`;

                const card = (
                  <Card
                    key={member.id}
                    className={
                      isLoggedIn
                        ? "transition-all hover:shadow-md hover:border-sepia-pale cursor-pointer"
                        : ""
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          url={member.profilePhoto}
                          initials={member.firstNameTh}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-charcoal">{fullName}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <Badge variant="secondary">{dept}</Badge>
                            <Badge variant="outline">รุ่นที่ {gen}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {isLoggedIn && (member.occupation || member.workplace) && (
                      <CardContent className="pt-0 space-y-1.5">
                        {member.occupation && (
                          <p className="flex items-center gap-2 text-sm text-sepia-mid">
                            <Briefcase className="size-3.5 shrink-0 text-sepia-light" />
                            {member.occupation}
                          </p>
                        )}
                        {member.workplace && (
                          <p className="flex items-center gap-2 text-sm text-sepia-mid">
                            <Building2 className="size-3.5 shrink-0 text-sepia-light" />
                            {member.workplace}
                          </p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );

                return isLoggedIn ? (
                  <Link key={member.id} href={`/members/${member.id}`}>
                    {card}
                  </Link>
                ) : (
                  <div key={member.id}>{card}</div>
                );
              })}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath="/members"
              searchParams={paginationParams}
            />
          </>
        )}
      </div>
    </div>
  );
}
