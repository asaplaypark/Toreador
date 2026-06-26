import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDeptLabel, getGeneration } from "@/lib/departments";
import AvatarUpload from "@/components/AvatarUpload";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      firstNameTh: true,
      lastNameTh: true,
      nickname: true,
      formerFirstName: true,
      formerLastName: true,
      department: true,
      yearOfEntry: true,
      profilePhoto: true,
    },
  });

  if (!member) {
    redirect("/member/register");
  }

  const dept = getDeptLabel(member.department);
  const gen = getGeneration(member.yearOfEntry);

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-lg border border-sepia-pale/60 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <AvatarUpload
              initialUrl={member.profilePhoto}
              initials={member.firstNameTh}
            />
            <div className="text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-widest text-sepia-mid mb-1">
                ยินดีต้อนรับ
              </p>
              <h1 className="text-xl font-medium text-charcoal">
                คุณ{member.firstNameTh} {member.lastNameTh}
                {member.nickname && (
                  <span className="ml-1 text-lg font-normal text-sepia-mid">({member.nickname})</span>
                )}
              </h1>
              {(member.formerFirstName || member.formerLastName) && (
                <p className="text-sm text-muted-foreground">
                  เดิม: {[member.formerFirstName, member.formerLastName].filter(Boolean).join(" ")}
                </p>
              )}
              <p className="mt-0.5 text-sm text-muted-foreground">
                {session.user?.email}
              </p>
              <p className="mt-1 text-sm text-sepia-mid">
                {dept} · รุ่นที่ {gen}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/profile/edit">แก้ไขโปรไฟล์</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/members/${member.id}`}>ดูโปรไฟล์</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
