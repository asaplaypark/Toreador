import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateSlug } from "@/lib/slug";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !ALLOWED_ROLES.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const body = await req.json();
  const { title, content, excerpt, category, tags, coverImage, visibility, status } =
    body as {
      title: string;
      content: string;
      excerpt?: string;
      category?: string;
      tags?: string[];
      coverImage?: string;
      visibility?: string;
      status?: string;
    };

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "กรุณากรอก title และ content" }, { status: 400 });
  }

  const slug = generateSlug(title);

  const news = await prisma.news.create({
    data: {
      title: title.trim(),
      slug,
      content,
      excerpt: excerpt?.trim() || null,
      category: category?.trim() || null,
      tags: tags ?? [],
      coverImage: coverImage?.trim() || null,
      visibility: (visibility as "PUBLIC" | "MEMBERS_ONLY" | "ADMIN_ONLY") ?? "PUBLIC",
      status: (status as "DRAFT" | "PUBLISHED" | "ARCHIVED") ?? "DRAFT",
      authorId: session.user.id,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  return NextResponse.json(news, { status: 201 });
}
