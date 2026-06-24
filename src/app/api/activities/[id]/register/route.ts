import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const activity = await prisma.activity.findUnique({
      where: { id, deletedAt: null, status: "PUBLISHED" },
      include: { _count: { select: { registrations: true } } },
    });
    if (!activity) {
      return NextResponse.json({ error: "ไม่พบกิจกรรม" }, { status: 404 });
    }
    if (!activity.requireRegistration) {
      return NextResponse.json({ error: "กิจกรรมนี้ไม่ต้องจองที่นั่ง" }, { status: 400 });
    }
    if (activity.visibility === "MEMBERS_ONLY" && !session?.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }
    if (activity.registrationDeadline && activity.registrationDeadline < new Date()) {
      return NextResponse.json({ error: "หมดเวลาจองแล้ว" }, { status: 400 });
    }
    if (activity.maxSeats !== null && activity._count.registrations >= activity.maxSeats) {
      return NextResponse.json({ error: "ที่นั่งเต็มแล้ว" }, { status: 400 });
    }

    const body = await req.json();
    const { registrantName, registrantEmail, registrantPhone, registrantLineId, note } =
      body as Record<string, string | undefined>;

    if (!registrantName?.trim()) {
      return NextResponse.json({ error: "กรุณากรอกชื่อ-นามสกุล" }, { status: 400 });
    }
    if (!registrantEmail?.trim()) {
      return NextResponse.json({ error: "กรุณากรอกอีเมล" }, { status: 400 });
    }
    if (!registrantPhone?.trim()) {
      return NextResponse.json({ error: "กรุณากรอกเบอร์โทรศัพท์" }, { status: 400 });
    }

    // Resolve memberId (null for guests)
    let memberId: string | null = null;
    if (session?.user?.id) {
      const member = await prisma.member.findUnique({
        where: { userId: session.user.id, deletedAt: null },
        select: { id: true },
      });
      memberId = member?.id ?? null;
    }

    // Duplicate check
    if (memberId) {
      const existing = await prisma.activityRegistration.findUnique({
        where: { activityId_memberId: { activityId: id, memberId } },
      });
      if (existing) {
        return NextResponse.json({ error: "คุณได้จองแล้ว" }, { status: 409 });
      }
    } else {
      const existing = await prisma.activityRegistration.findFirst({
        where: {
          activityId: id,
          memberId: null,
          registrantEmail: registrantEmail.trim().toLowerCase(),
        },
      });
      if (existing) {
        return NextResponse.json({ error: "อีเมลนี้ได้ลงทะเบียนแล้ว" }, { status: 409 });
      }
    }

    const reg = await prisma.activityRegistration.create({
      data: {
        activityId: id,
        memberId,
        registrantName: registrantName.trim(),
        registrantEmail: registrantEmail.trim().toLowerCase(),
        registrantPhone: registrantPhone.trim(),
        registrantLineId: registrantLineId?.trim() || null,
        note: note?.trim() || null,
      },
    });
    return NextResponse.json(reg, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { id } = await params;
    const member = await prisma.member.findUnique({
      where: { userId: session.user.id, deletedAt: null },
      select: { id: true },
    });
    if (!member) {
      return NextResponse.json({ error: "ไม่พบข้อมูลสมาชิก" }, { status: 404 });
    }

    await prisma.activityRegistration.deleteMany({
      where: { activityId: id, memberId: member.id },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unregister error:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
