import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateActivitySlug } from "@/lib/slug";

const ALLOWED = ["ADMIN", "SUPER_ADMIN"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ALLOWED.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title, description, coverImage, location, onlineLink,
    startDate, endDate, registrationDeadline, maxSeats,
    requireRegistration, allowGuestView, visibility, status,
  } = body as Record<string, string | number | boolean | null | undefined>;

  if (!title || !startDate) {
    return NextResponse.json({ error: "กรุณากรอก title และ startDate" }, { status: 400 });
  }

  const activity = await prisma.activity.create({
    data: {
      title: String(title).trim(),
      slug: generateActivitySlug(String(title)),
      description: String(description ?? ""),
      coverImage: coverImage ? String(coverImage).trim() : null,
      location: location ? String(location).trim() : null,
      onlineLink: onlineLink ? String(onlineLink).trim() : null,
      startDate: new Date(String(startDate)),
      endDate: endDate ? new Date(String(endDate)) : null,
      registrationDeadline: registrationDeadline ? new Date(String(registrationDeadline)) : null,
      maxSeats: maxSeats != null ? Number(maxSeats) : null,
      requireRegistration: Boolean(requireRegistration ?? true),
      allowGuestView: Boolean(allowGuestView ?? true),
      visibility: (visibility as "PUBLIC" | "MEMBERS_ONLY") ?? "PUBLIC",
      status: (status as "DRAFT" | "PUBLISHED") ?? "DRAFT",
      createdBy: session.user.id,
    },
  });

  return NextResponse.json(activity, { status: 201 });
}
