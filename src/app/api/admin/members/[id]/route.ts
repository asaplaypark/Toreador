import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Department, MemberStatus, Role } from "@prisma/client";

const VALID_DEPARTMENTS = Object.values(Department);
const VALID_STATUSES = Object.values(MemberStatus);
const VALID_ROLES = Object.values(Role);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const role = session.user.role as string;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id, deletedAt: null },
    select: { id: true, userId: true },
  });
  if (!member) {
    return NextResponse.json({ error: "ไม่พบสมาชิก" }, { status: 404 });
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

  const birthDateStr = body.birthDate as string | undefined;
  if (!birthDateStr) return NextResponse.json({ error: "กรุณาระบุวันเกิด" }, { status: 400 });
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return NextResponse.json({ error: "วันเกิดไม่ถูกต้อง" }, { status: 400 });

  const department = body.department as string | undefined;
  if (!department || !VALID_DEPARTMENTS.includes(department as Department)) {
    return NextResponse.json({ error: "กรุณาเลือกภาควิชา" }, { status: 400 });
  }

  const yearOfEntry = parseInt(body.yearOfEntry as string, 10);
  if (!yearOfEntry || yearOfEntry < 2476 || yearOfEntry > 2600) {
    return NextResponse.json({ error: "ปีที่เข้าศึกษา (พ.ศ.) ไม่ถูกต้อง" }, { status: 400 });
  }

  const status = body.status as string | undefined;
  if (!status || !VALID_STATUSES.includes(status as MemberStatus)) {
    return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
  }

  await prisma.member.update({
    where: { id },
    data: {
      firstNameTh,
      lastNameTh,
      firstNameEn: (body.firstNameEn as string | undefined)?.trim() || null,
      lastNameEn: (body.lastNameEn as string | undefined)?.trim() || null,
      nickname: (body.nickname as string | undefined)?.trim() || null,
      formerFirstName: (body.formerFirstName as string | undefined)?.trim() || null,
      formerLastName: (body.formerLastName as string | undefined)?.trim() || null,
      birthDate,
      department: department as Department,
      yearOfEntry,
      phone: (body.phone as string | undefined)?.trim() || null,
      occupation: (body.occupation as string | undefined)?.trim() || null,
      workplace: (body.workplace as string | undefined)?.trim() || null,
      lineId: (body.lineId as string | undefined)?.trim() || null,
      website: (body.website as string | undefined)?.trim() || null,
      bio: (body.bio as string | undefined)?.trim() || null,
      profilePhoto: (body.profilePhoto as string | undefined)?.trim() || null,
      status: status as MemberStatus,
    },
  });

  // SUPER_ADMIN can also update the user's role
  if (role === "SUPER_ADMIN" && body.role) {
    const newRole = body.role as string;
    if (VALID_ROLES.includes(newRole as Role)) {
      await prisma.user.update({
        where: { id: member.userId },
        data: { role: newRole as Role },
      });
    }
  }

  void prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ADMIN_UPDATE_MEMBER",
      targetType: "Member",
      targetId: id,
      after: { updatedFields: Object.keys(body) },
    },
  });

  return NextResponse.json({ success: true });
}
