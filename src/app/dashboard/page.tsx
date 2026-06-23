import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true, firstNameTh: true, lastNameTh: true, department: true, yearOfEntry: true },
  });

  if (!member) {
    redirect("/member/register");
  }

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-lg border border-sepia-pale/60 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-widest text-sepia-mid mb-1">
            ยินดีต้อนรับ
          </p>
          <h1 className="text-xl font-medium text-charcoal">
            คุณ{member.firstNameTh} {member.lastNameTh}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.user?.email}
          </p>
        </div>
      </div>
    </div>
  );
}
