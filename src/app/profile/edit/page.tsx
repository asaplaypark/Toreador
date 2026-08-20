import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDeptLabel, getGeneration } from "@/lib/departments";
import ProfileEditForm from "./ProfileEditForm";

export default async function ProfileEditPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string; error?: string }>;
}) {
  const { linked, error } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile/edit");

  const [member, userInfo] = await Promise.all([
    prisma.member.findUnique({
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
        formerFirstName: true,
        formerLastName: true,
        fieldVisibility: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lineUserId: true, lineDisplayName: true },
    }),
  ]);

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
        {linked === "1" && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            เชื่อมต่อบัญชี LINE เรียบร้อยแล้ว
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            ไม่สามารถเชื่อมต่อ LINE ได้ กรุณาลองใหม่อีกครั้ง
          </div>
        )}
        <ProfileEditForm
          memberId={member.id}
          lineConnected={!!userInfo?.lineUserId}
          lineDisplayName={userInfo?.lineDisplayName ?? null}
          initialData={{
            firstNameTh: member.firstNameTh,
            lastNameTh: member.lastNameTh,
            firstNameEn: member.firstNameEn ?? "",
            lastNameEn: member.lastNameEn ?? "",
            nickname: member.nickname ?? "",
            formerFirstName: member.formerFirstName ?? "",
            formerLastName: member.formerLastName ?? "",
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
