import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MemberRegisterForm from "./MemberRegisterForm";

export default async function MemberRegisterPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const existing = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (existing) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            ลงทะเบียนข้อมูลสมาชิก
          </h1>
          <p className="text-sm text-muted-foreground">
            กรุณากรอกข้อมูลให้ครบถ้วนเพื่อเข้าใช้งานระบบ
            ช่องที่มีเครื่องหมาย{" "}
            <span className="text-destructive font-medium">*</span> จำเป็นต้องกรอก
          </p>
        </div>

        <MemberRegisterForm />
      </div>
    </div>
  );
}
