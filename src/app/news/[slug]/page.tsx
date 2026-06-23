import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

function authorName(author: {
  email: string | null;
  member: { firstNameTh: string; lastNameTh: string } | null;
}): string {
  if (author.member) return `${author.member.firstNameTh} ${author.member.lastNameTh}`;
  return "ผู้ดูแลระบบ";
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;

  const news = await prisma.news.findUnique({
    where: { slug, deletedAt: null },
    select: {
      title: true,
      content: true,
      excerpt: true,
      coverImage: true,
      category: true,
      tags: true,
      publishedAt: true,
      status: true,
      visibility: true,
      author: {
        select: {
          email: true,
          member: { select: { firstNameTh: true, lastNameTh: true } },
        },
      },
    },
  });

  if (!news || news.status !== "PUBLISHED") notFound();

  const isMembersOnly = news.visibility === "MEMBERS_ONLY";
  const isAdminOnly = news.visibility === "ADMIN_ONLY";

  if (isAdminOnly) notFound();

  const canRead = !isMembersOnly || isLoggedIn;

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/news">
            <ArrowLeft className="mr-1 size-4" />
            กลับไปข่าวสาร
          </Link>
        </Button>

        {/* Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {news.category && <Badge variant="outline">{news.category}</Badge>}
            {isMembersOnly && (
              <span className="flex items-center gap-1 text-xs text-sepia-mid">
                <Lock className="size-3" />
                สมาชิกเท่านั้น
              </span>
            )}
          </div>

          <h1 className="text-xl font-medium leading-snug text-charcoal sm:text-2xl lg:text-3xl">
            {news.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{authorName(news.author)}</span>
            {news.publishedAt && (
              <>
                <span>·</span>
                <span>
                  {news.publishedAt.toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Cover image */}
        {news.coverImage && (
          <div className="overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={news.coverImage}
              alt={news.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        {canRead ? (
          <div
            className="news-content text-sm leading-relaxed text-charcoal"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        ) : (
          <div className="rounded-lg border border-sepia-pale/60 bg-sepia-cream/60 px-6 py-12 text-center">
            <Lock className="mx-auto mb-3 size-8 text-sepia-light" />
            <p className="font-medium text-charcoal">กรุณาเข้าสู่ระบบเพื่ออ่านข่าวนี้</p>
            <p className="mt-1 text-sm text-muted-foreground">
              ข่าวนี้สำหรับสมาชิกเท่านั้น
            </p>
            <Button asChild className="mt-4">
              <Link href="/login">เข้าสู่ระบบ</Link>
            </Button>
          </div>
        )}

        {/* Tags */}
        {news.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-sepia-pale/40 pt-4">
            {news.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
