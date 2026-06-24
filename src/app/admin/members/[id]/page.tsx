import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getDeptLabel, getGeneration } from "@/lib/departments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MemberStatusActions from "../MemberStatusActions";
import { MemberStatus } from "@prisma/client";

const STATUS_LABELS: Record<MemberStatus, string> = {
  PENDING: "รอการอนุมัติ",
  ACTIVE: "สมาชิก",
  INACTIVE: "ระงับชั่วคราว",
  REJECTED: "ปฏิเสธ",
};

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id, deletedAt: null },
    include: {
      user: { select: { email: true, createdAt: true, lastLoginAt: true } },
    },
  });

  if (!member) notFound();

  const gen = getGeneration(member.yearOfEntry);
  const dept = getDeptLabel(member.department);

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/members">
              <ArrowLeft className="mr-1 size-4" />
              กลับ
            </Link>
          </Button>
          <h1 className="flex-1 text-xl font-medium text-charcoal">
            {member.firstNameTh} {member.lastNameTh}
          </h1>
          <Badge
            variant={
              member.status === MemberStatus.REJECTED ? "destructive" : "outline"
            }
            className={
              member.status === MemberStatus.PENDING
                ? "border-amber-400 text-amber-700"
                : undefined
            }
          >
            {STATUS_LABELS[member.status]}
          </Badge>
        </div>

        {/* Status actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
              เปลี่ยนสถานะ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MemberStatusActions memberId={member.id} currentStatus={member.status} />
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
              ข้อมูลสมาชิก
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="ชื่อ-นามสกุล (ไทย)">
              {member.firstNameTh} {member.lastNameTh}
            </Row>
            {member.nickname && (
              <Row label="ชื่อเล่น">{member.nickname}</Row>
            )}
            {member.firstNameEn && (
              <Row label="ชื่อ-นามสกุล (อังกฤษ)">
                {member.firstNameEn} {member.lastNameEn}
              </Row>
            )}
            <Row label="อีเมล">{member.user.email ?? "—"}</Row>
            <Row label="ภาควิชา">{dept}</Row>
            <Row label="รุ่นที่">{gen}</Row>
            <Row label="ปีที่เข้า">{member.yearOfEntry}</Row>
            {member.phone && <Row label="โทรศัพท์">{member.phone}</Row>}
            {member.occupation && <Row label="อาชีพ">{member.occupation}</Row>}
            {member.workplace && <Row label="ที่ทำงาน">{member.workplace}</Row>}
            {member.lineId && <Row label="LINE ID">{member.lineId}</Row>}
            {member.website && <Row label="เว็บไซต์">{member.website}</Row>}
            {member.bio && <Row label="แนะนำตัว">{member.bio}</Row>}
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
              ข้อมูลบัญชี
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="สมัครเมื่อ">
              {member.user.createdAt.toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Row>
            <Row label="เข้าสู่ระบบล่าสุด">
              {member.user.lastLoginAt
                ? member.user.lastLoginAt.toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </Row>
            <Row label="แหล่งข้อมูล">{member.dataSource}</Row>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="w-44 shrink-0 text-muted-foreground">{label}</span>
      <span className="text-charcoal">{children}</span>
    </div>
  );
}
