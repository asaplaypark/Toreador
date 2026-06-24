import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // "upcoming" | "past"

  const now = new Date();
  const dateFilter =
    filter === "past"
      ? { startDate: { lt: now } }
      : filter === "upcoming"
        ? { startDate: { gte: now } }
        : {};

  const activities = await prisma.activity.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      ...(isLoggedIn ? {} : { allowGuestView: true }),
      ...dateFilter,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true,
      location: true,
      startDate: true,
      endDate: true,
      maxSeats: true,
      requireRegistration: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json(activities);
}
