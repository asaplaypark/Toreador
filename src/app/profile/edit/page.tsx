import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDeptLabel, getGeneration } from "@/lib/departments";
import ProfileEditForm from "./ProfileEditForm";

export default async function ProfileEditPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile/edit");

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id, deletedAt: null },
    select: {
      id: true,
      firstNameTh: true,
      lastNameTh: true,
      firstNameEn: true,
      lastNameEn: true,
      nickname: true,
      department: true,
      yearOfEntry: true,
      birthDate: true,
      phone: true,
      profilePhoto: true,
      occupation: true,
      workplace: true,
      bio: true,
      lineId: true,
      website: true,
      fieldVisibility: true,
    },
  });

  if (!member) redirect("/member/register");

  const deptLabel = getDeptLabel(member.department);
  const gen = getGeneration(member.yearOfEntry);

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-charcoal">แก้ไขโปรไฟล์</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            อัปเดตข้อมูลส่วนตัวและการตั้งค่าความเป็นส่วนตัว
          </p>
        </div>
        <ProfileEditForm
          memberId={member.id}
          initialData={{
            firstNameTh: member.firstNameTh,
            lastNameTh: member.lastNameTh,
            firstNameEn: member.firstNameEn ?? "",
            lastNameEn: member.lastNameEn ?? "",
            nickname: member.nickname ?? "",
            phone: member.phone ?? "",
            occupation: member.occupation ?? "",
            workplace: member.workplace ?? "",
            lineId: member.lineId ?? "",
            website: member.website ?? "",
            bio: member.bio ?? "",
            profilePhoto: member.profilePhoto ?? null,
            fieldVisibility: (member.fieldVisibility as Record<string, string>) ?? {},
          }}
          readOnlyInfo={{
            department: deptLabel,
            yearOfEntry: `รุ่นที่ ${gen} (${member.yearOfEntry})`,
            birthDate: member.birthDate.toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          }}
        />
      </div>
    </div>
  );
}
