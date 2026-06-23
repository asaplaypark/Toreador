import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Department } from "@prisma/client";

const VALID_DEPARTMENTS = Object.values(Department);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const existing = await prisma.member.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json(
      { error: "มีข้อมูลสมาชิกอยู่แล้ว" },
      { status: 409 }
    );
  }

  try {
    const body = await req.json();
    const {
      firstNameTh,
      lastNameTh,
      firstNameEn,
      lastNameEn,
      birthDate,
      department,
      yearOfEntry,
      phone,
      occupation,
      workplace,
      lineId,
      website,
      bio,
      consentGiven,
    } = body;

    if (!firstNameTh?.trim()) {
      return NextResponse.json({ error: "กรุณากรอกชื่อ" }, { status: 400 });
    }
    if (!lastNameTh?.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกนามสกุล" },
        { status: 400 }
      );
    }
    if (!birthDate) {
      return NextResponse.json(
        { error: "กรุณาเลือกวันเดือนปีเกิด" },
        { status: 400 }
      );
    }
    if (!department || !VALID_DEPARTMENTS.includes(department)) {
      return NextResponse.json(
        { error: "กรุณาเลือกภาควิชา" },
        { status: 400 }
      );
    }
    const yearNum = parseInt(yearOfEntry, 10);
    if (!yearNum || yearNum < 2476 || yearNum > 2600) {
      return NextResponse.json(
        { error: "กรุณากรอกปีที่เข้าศึกษา (พ.ศ.) ให้ถูกต้อง" },
        { status: 400 }
      );
    }
    if (!consentGiven) {
      return NextResponse.json(
        { error: "กรุณายินยอมนโยบายคุ้มครองข้อมูลส่วนบุคคล" },
        { status: 400 }
      );
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.member.create({
        data: {
          userId: session.user.id,
          firstNameTh: firstNameTh.trim(),
          lastNameTh: lastNameTh.trim(),
          firstNameEn: firstNameEn?.trim() || null,
          lastNameEn: lastNameEn?.trim() || null,
          birthDate: new Date(birthDate),
          department: department as Department,
          yearOfEntry: yearNum,
          phone: phone?.trim() || null,
          occupation: occupation?.trim() || null,
          workplace: workplace?.trim() || null,
          lineId: lineId?.trim() || null,
          website: website?.trim() || null,
          bio: bio?.trim() || null,
          dataSource: "SELF_REGISTERED",
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          consentGiven: true,
          consentAt: now,
          consentVersion: "1.0",
        },
      }),
    ]);

    return NextResponse.json({ message: "ลงทะเบียนสำเร็จ" }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
