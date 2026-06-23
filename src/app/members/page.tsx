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
  CardTitle,
} from "@/components/ui/card";
import MemberFilters from "./MemberFilters";
import { Department, MemberStatus, Prisma } from "@prisma/client";
import { Briefcase, Building2, Users } from "lucide-react";

type SearchParams = {
  search?: string;
  department?: string;
  generation?: string;
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
  const yearOfEntry = generationStr
    ? 2475 + parseInt(generationStr, 10)
    : undefined;

  const members = await prisma.member.findMany({
    where: {
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
    },
    select: {
      id: true,
      firstNameTh: true,
      lastNameTh: true,
      department: true,
      yearOfEntry: true,
      occupation: true,
      workplace: true,
    },
    orderBy: [{ yearOfEntry: "asc" }, { firstNameTh: "asc" }],
  });

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Users className="size-6" />
              ทำเนียบสมาชิก
            </h1>
            <p className="text-sm text-muted-foreground">
              พบ{" "}
              <span className="font-medium text-foreground">
                {members.length}
              </span>{" "}
              คน
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
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Users className="size-10 mb-3 opacity-30" />
            <p>ไม่พบสมาชิกที่ตรงกับเงื่อนไข</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => {
              const gen = getGeneration(member.yearOfEntry);
              const dept = getDeptLabel(member.department);
              const fullName = `${member.firstNameTh} ${member.lastNameTh}`;

              const card = (
                <Card
                  key={member.id}
                  className={
                    isLoggedIn
                      ? "transition-shadow hover:shadow-md cursor-pointer"
                      : ""
                  }
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{fullName}</CardTitle>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <Badge variant="secondary">{dept}</Badge>
                      <Badge variant="outline">รุ่นที่ {gen}</Badge>
                    </div>
                  </CardHeader>

                  {isLoggedIn && (member.occupation || member.workplace) && (
                    <CardContent className="pt-0 space-y-1.5">
                      {member.occupation && (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="size-3.5 shrink-0" />
                          {member.occupation}
                        </p>
                      )}
                      {member.workplace && (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="size-3.5 shrink-0" />
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
        )}
      </div>
    </div>
  );
}
