import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import NewsForm from "../../NewsForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminNewsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const news = await prisma.news.findUnique({
    where: { id, deletedAt: null },
    select: {
      id: true,
      title: true,
      content: true,
      excerpt: true,
      category: true,
      tags: true,
      coverImage: true,
      visibility: true,
      status: true,
    },
  });

  if (!news) notFound();

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/news">
              <ArrowLeft className="mr-1 size-4" />
              กลับ
            </Link>
          </Button>
          <h1 className="text-xl font-medium text-charcoal">แก้ไขข่าว</h1>
        </div>

        <NewsForm
          newsId={news.id}
          initialValues={{
            title: news.title,
            content: news.content,
            excerpt: news.excerpt ?? "",
            category: news.category ?? "",
            tags: news.tags.join(", "),
            coverImage: news.coverImage ?? "",
            visibility: news.visibility,
            status: news.status,
          }}
        />
      </div>
    </div>
  );
}
