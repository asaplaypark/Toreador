import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { VisibilityLevel } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;

  const visibility: VisibilityLevel[] = isLoggedIn
    ? [VisibilityLevel.PUBLIC, VisibilityLevel.MEMBERS_ONLY]
    : [VisibilityLevel.PUBLIC];

  const news = await prisma.news.findMany({
    where: {
      status: "PUBLISHED",
      visibility: { in: visibility },
      deletedAt: null,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      category: true,
      publishedAt: true,
      visibility: true,
      author: {
        select: {
          email: true,
          member: { select: { firstNameTh: true, lastNameTh: true } },
        },
      },
    },
    orderBy: { publishedAt: "desc" },
  });

  return NextResponse.json(news);
}
