import { prisma } from "@/lib/prisma";
import { NewsStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NewsActions from "./NewsActions";
import { Plus } from "lucide-react";

const STATUS_LABELS: Record<NewsStatus, string> = {
  DRAFT: "ฉบับร่าง",
  PUBLISHED: "เผยแพร่แล้ว",
  ARCHIVED: "เก็บถาวร",
};

function NewsBadge({ status }: { status: NewsStatus }) {
  if (status === NewsStatus.PUBLISHED)
    return <Badge>{STATUS_LABELS[status]}</Badge>;
  if (status === NewsStatus.ARCHIVED)
    return <Badge variant="outline">{STATUS_LABELS[status]}</Badge>;
  return (
    <Badge variant="outline" className="border-amber-400 text-amber-700">
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export default async function AdminNewsPage() {
  const newsList = await prisma.news.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      visibility: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-charcoal">จัดการข่าวสาร</h1>
            <p className="mt-1 text-sm text-muted-foreground">{newsList.length} รายการ</p>
          </div>
          <Button asChild>
            <Link href="/admin/news/create">
              <Plus className="mr-1 size-4" />
              สร้างข่าวใหม่
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-sepia-pale/60 bg-white">
          {newsList.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">ยังไม่มีข่าวสาร</p>
          ) : (
            <table className="min-w-[640px] w-full text-sm">
              <thead className="border-b border-sepia-pale/60 bg-sepia-cream/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-sepia-mid">หัวข้อ</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-sepia-mid sm:table-cell">
                    หมวดหมู่
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sepia-mid">สถานะ</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-sepia-mid md:table-cell">
                    วันที่
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-sepia-mid">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sepia-pale/40">
                {newsList.map((news) => (
                  <tr key={news.id} className="transition-colors hover:bg-sepia-bg/50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-charcoal">{news.title}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {news.category ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <NewsBadge status={news.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {(news.publishedAt ?? news.createdAt).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-4 py-3">
                      <NewsActions newsId={news.id} currentStatus={news.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
