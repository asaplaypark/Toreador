import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AdminMemberEditForm from "./AdminMemberEditForm";

export default async function AdminMemberEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as string | undefined;

  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    redirect("/admin");
  }

  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id, deletedAt: null },
    include: {
      user: { select: { role: true } },
    },
  });

  if (!member) notFound();

  const birthDateISO = member.birthDate.toISOString().split("T")[0];

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/members/${id}`}>
              <ArrowLeft className="mr-1 size-4" />
              กลับ
            </Link>
          </Button>
          <h1 className="flex-1 text-xl font-medium text-charcoal">
            แก้ไขข้อมูล: {member.firstNameTh} {member.lastNameTh}
          </h1>
        </div>

        <AdminMemberEditForm
          memberId={id}
          isSuperAdmin={role === "SUPER_ADMIN"}
          initialData={{
            firstNameTh: member.firstNameTh,
            lastNameTh: member.lastNameTh,
            firstNameEn: member.firstNameEn ?? "",
            lastNameEn: member.lastNameEn ?? "",
            nickname: member.nickname ?? "",
            formerFirstName: member.formerFirstName ?? "",
            formerLastName: member.formerLastName ?? "",
            birthDate: birthDateISO,
            department: member.department,
            yearOfEntry: String(member.yearOfEntry),
            phone: member.phone ?? "",
            occupation: member.occupation ?? "",
            workplace: member.workplace ?? "",
            lineId: member.lineId ?? "",
            website: member.website ?? "",
            bio: member.bio ?? "",
            profilePhoto: member.profilePhoto ?? null,
            status: member.status,
            role: member.user.role,
          }}
        />
      </div>
    </div>
  );
}
