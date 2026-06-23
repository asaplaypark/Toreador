import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getDeptLabel, getGeneration } from "@/lib/departments";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MemberStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft, Briefcase, Building2, Calendar, Globe, MessageCircle, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/members/${(await params).id}`);
  }

  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id, status: MemberStatus.ACTIVE, deletedAt: null },
    select: {
      id: true,
      firstNameTh: true,
      lastNameTh: true,
      firstNameEn: true,
      lastNameEn: true,
      department: true,
      yearOfEntry: true,
      occupation: true,
      workplace: true,
      phone: true,
      lineId: true,
      website: true,
      bio: true,
      profilePhoto: true,
    },
  });

  if (!member) notFound();

  const gen = getGeneration(member.yearOfEntry);
  const dept = getDeptLabel(member.department);
  const nameTh = `${member.firstNameTh} ${member.lastNameTh}`;
  const nameEn =
    member.firstNameEn && member.lastNameEn
      ? `${member.firstNameEn} ${member.lastNameEn}`
      : null;

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/members">
            <ArrowLeft className="size-4 mr-1" />
            กลับไปทำเนียบสมาชิก
          </Link>
        </Button>

        {/* Profile header */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              {/* Avatar placeholder */}
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-muted-foreground select-none">
                {member.firstNameTh.charAt(0)}
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">{nameTh}</CardTitle>
                {nameEn && (
                  <p className="text-sm text-muted-foreground">{nameEn}</p>
                )}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="secondary">{dept}</Badge>
                  <Badge variant="outline">รุ่นที่ {gen}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          {member.bio && (
            <CardContent className="border-t pt-4">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {member.bio}
              </p>
            </CardContent>
          )}
        </Card>

        {/* Work info */}
        {(member.occupation || member.workplace) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                การทำงาน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.occupation && (
                <Row icon={<Briefcase className="size-4" />} label="อาชีพ">
                  {member.occupation}
                </Row>
              )}
              {member.workplace && (
                <Row icon={<Building2 className="size-4" />} label="ที่ทำงาน">
                  {member.workplace}
                </Row>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contact info */}
        {(member.phone || member.lineId || member.website) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                ช่องทางติดต่อ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.phone && (
                <Row icon={<Phone className="size-4" />} label="โทรศัพท์">
                  <a
                    href={`tel:${member.phone}`}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    {member.phone}
                  </a>
                </Row>
              )}
              {member.lineId && (
                <Row icon={<MessageCircle className="size-4" />} label="LINE ID">
                  {member.lineId}
                </Row>
              )}
              {member.website && (
                <Row icon={<Globe className="size-4" />} label="เว็บไซต์">
                  <a
                    href={member.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline underline-offset-4 break-all"
                  >
                    {member.website}
                  </a>
                </Row>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
