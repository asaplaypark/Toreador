import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ALLOWED = ["ADMIN", "SUPER_ADMIN"];
type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ALLOWED.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.activity.findUnique({ where: { id, deletedAt: null } });
  if (!existing) return NextResponse.json({ error: "ไม่พบกิจกรรม" }, { status: 404 });

  const body = await req.json();
  const {
    title, description, coverImage, location, onlineLink,
    startDate, endDate, registrationDeadline, maxSeats,
    requireRegistration, allowGuestView, visibility, status,
  } = body as Record<string, string | number | boolean | null | undefined>;

  const updated = await prisma.activity.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: String(title).trim() }),
      ...(description !== undefined && { description: String(description) }),
      coverImage: coverImage ? String(coverImage).trim() : null,
      location: location ? String(location).trim() : null,
      onlineLink: onlineLink ? String(onlineLink).trim() : null,
      ...(startDate !== undefined && { startDate: new Date(String(startDate)) }),
      endDate: endDate ? new Date(String(endDate)) : null,
      registrationDeadline: registrationDeadline ? new Date(String(registrationDeadline)) : null,
      maxSeats: maxSeats != null && maxSeats !== "" ? Number(maxSeats) : null,
      ...(requireRegistration !== undefined && { requireRegistration: Boolean(requireRegistration) }),
      ...(allowGuestView !== undefined && { allowGuestView: Boolean(allowGuestView) }),
      ...(visibility !== undefined && { visibility: visibility as "PUBLIC" | "MEMBERS_ONLY" }),
      ...(status !== undefined && { status: status as "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED" }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ALLOWED.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.activity.findUnique({ where: { id, deletedAt: null } });
  if (!existing) return NextResponse.json({ error: "ไม่พบกิจกรรม" }, { status: 404 });

  await prisma.activity.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
