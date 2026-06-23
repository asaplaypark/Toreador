import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ALLOWED_ROLES.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, content, excerpt, category, tags, coverImage, visibility, status } =
    body as {
      title?: string;
      content?: string;
      excerpt?: string;
      category?: string;
      tags?: string[];
      coverImage?: string;
      visibility?: string;
      status?: string;
    };

  const existing = await prisma.news.findUnique({ where: { id, deletedAt: null } });
  if (!existing) return NextResponse.json({ error: "ไม่พบข่าว" }, { status: 404 });

  const updated = await prisma.news.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(content !== undefined && { content }),
      excerpt: excerpt?.trim() || null,
      category: category?.trim() || null,
      tags: tags ?? existing.tags,
      coverImage: coverImage?.trim() || null,
      ...(visibility !== undefined && {
        visibility: visibility as "PUBLIC" | "MEMBERS_ONLY" | "ADMIN_ONLY",
      }),
      ...(status !== undefined && {
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        publishedAt:
          status === "PUBLISHED"
            ? existing.publishedAt ?? new Date()
            : existing.publishedAt,
      }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ALLOWED_ROLES.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.news.findUnique({ where: { id, deletedAt: null } });
  if (!existing) return NextResponse.json({ error: "ไม่พบข่าว" }, { status: 404 });

  await prisma.news.update({ where: { id }, data: { deletedAt: new Date() } });

  return NextResponse.json({ ok: true });
}
