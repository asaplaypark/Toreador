import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { MemberStatus } from "@prisma/client";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN"];
const VALID_STATUSES = Object.values(MemberStatus) as string[];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !ALLOWED_ROLES.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body as { status: string };

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
  }

  const member = await prisma.member.findUnique({
    where: { id, deletedAt: null },
  });
  if (!member) {
    return NextResponse.json({ error: "ไม่พบสมาชิก" }, { status: 404 });
  }

  const [updated] = await prisma.$transaction([
    prisma.member.update({
      where: { id },
      data: {
        status: status as MemberStatus,
        ...(status === "ACTIVE"
          ? { approvedBy: session.user.id, approvedAt: new Date() }
          : {}),
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CHANGE_MEMBER_STATUS",
        targetType: "Member",
        targetId: id,
        before: { status: member.status },
        after: { status },
      },
    }),
  ]);

  return NextResponse.json(updated);
}
