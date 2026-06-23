import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VisibilityLevel } from "@prisma/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

function authorName(author: {
  email: string | null;
  member: { firstNameTh: string; lastNameTh: string } | null;
}): string {
  if (author.member) return `${author.member.firstNameTh} ${author.member.lastNameTh}`;
  return "ผู้ดูแลระบบ";
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function NewsPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;

  const visibility: VisibilityLevel[] = isLoggedIn
    ? [VisibilityLevel.PUBLIC, VisibilityLevel.MEMBERS_ONLY]
    : [VisibilityLevel.PUBLIC];

  const newsList = await prisma.news.findMany({
    where: {
      status: "PUBLISHED",
      visibility: { in: visibility },
      deletedAt: null,
    },
    select: {
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

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">ข่าวสาร</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ข่าวสารและประกาศจากสมาคมฯ
          </p>
        </div>

        {newsList.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            ยังไม่มีข่าวสารในขณะนี้
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newsList.map((news) => (
              <Link
                key={news.slug}
                href={`/news/${news.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-sepia-pale/60 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Cover image */}
                <div className="aspect-video w-full overflow-hidden bg-sepia-cream">
                  {news.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={news.coverImage}
                      alt={news.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-3xl font-semibold text-sepia-pale select-none">
                        T
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center gap-2">
                    {news.category && (
                      <Badge variant="outline" className="text-xs">
                        {news.category}
                      </Badge>
                    )}
                    {news.visibility === VisibilityLevel.MEMBERS_ONLY && (
                      <span className="flex items-center gap-1 text-xs text-sepia-mid">
                        <Lock className="size-3" />
                        สมาชิก
                      </span>
                    )}
                  </div>

                  <h2 className="line-clamp-2 font-medium text-charcoal transition-colors group-hover:text-sepia">
                    {news.title}
                  </h2>

                  {news.excerpt && (
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {news.excerpt}
                    </p>
                  )}

                  <div className="mt-auto pt-3 text-xs text-muted-foreground">
                    <span>{authorName(news.author)}</span>
                    {news.publishedAt && (
                      <>
                        <span className="mx-1">·</span>
                        <span>{formatDate(news.publishedAt)}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
