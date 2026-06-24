import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ALLOWED = ["ADMIN", "SUPER_ADMIN"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ALLOWED.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const { registrationId } = await req.json();
  if (!registrationId) {
    return NextResponse.json({ error: "ต้องการ registrationId" }, { status: 400 });
  }

  const updated = await prisma.activityRegistration.update({
    where: { id: registrationId },
    data: { checkedIn: true, checkedInAt: new Date() },
  });

  return NextResponse.json(updated);
}
