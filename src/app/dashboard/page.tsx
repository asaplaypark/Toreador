import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true, firstNameTh: true, lastNameTh: true },
  });

  if (!member) {
    redirect("/member/register");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="border-b bg-background px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">แดชบอร์ด</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{session.user?.email}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-lg border bg-background p-6">
            <h2 className="text-lg font-medium mb-2">
              ยินดีต้อนรับ คุณ{member.firstNameTh} {member.lastNameTh}
            </h2>
            <p className="text-muted-foreground">
              คุณเข้าสู่ระบบด้วยอีเมล{" "}
              <span className="font-medium text-foreground">{session.user?.email}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
