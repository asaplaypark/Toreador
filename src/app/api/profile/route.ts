import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const VISIBILITY_VALUES = ["PUBLIC", "MEMBERS_ONLY", "ADMIN_ONLY"];
const VISIBILITY_FIELDS = ["phone", "occupation", "workplace", "lineId", "website", "bio", "birthDate"];

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id, deletedAt: null },
    select: { id: true },
  });
  if (!member) {
    return NextResponse.json({ error: "ไม่พบข้อมูลสมาชิก" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const firstNameTh = (body.firstNameTh as string | undefined)?.trim();
  const lastNameTh = (body.lastNameTh as string | undefined)?.trim();
  if (!firstNameTh) return NextResponse.json({ error: "กรุณากรอกชื่อ (ภาษาไทย)" }, { status: 400 });
  if (!lastNameTh) return NextResponse.json({ error: "กรุณากรอกนามสกุล (ภาษาไทย)" }, { status: 400 });

  // Build fieldVisibility — only update known fields with valid values
  const incomingVisibility = (body.fieldVisibility as Record<string, string> | undefined) ?? {};
  const fieldVisibility: Record<string, string> = {};
  for (const field of VISIBILITY_FIELDS) {
    const val = incomingVisibility[field];
    if (val && VISIBILITY_VALUES.includes(val)) {
      fieldVisibility[field] = val;
    }
  }

  const updated = await prisma.member.update({
    where: { id: member.id },
    data: {
      firstNameTh,
      lastNameTh,
      firstNameEn: (body.firstNameEn as string | undefined)?.trim() || null,
      lastNameEn: (body.lastNameEn as string | undefined)?.trim() || null,
      nickname: (body.nickname as string | undefined)?.trim() || null,
      phone: (body.phone as string | undefined)?.trim() || null,
      occupation: (body.occupation as string | undefined)?.trim() || null,
      workplace: (body.workplace as string | undefined)?.trim() || null,
      lineId: (body.lineId as string | undefined)?.trim() || null,
      website: (body.website as string | undefined)?.trim() || null,
      bio: (body.bio as string | undefined)?.trim() || null,
      fieldVisibility,
    },
    select: {
      id: true,
      firstNameTh: true,
      lastNameTh: true,
    },
  });

  void prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE_PROFILE",
      targetType: "Member",
      targetId: member.id,
      after: { updatedFields: Object.keys(body).filter((k) => k !== "fieldVisibility") },
    },
  });

  return NextResponse.json({ success: true, member: updated });
}
