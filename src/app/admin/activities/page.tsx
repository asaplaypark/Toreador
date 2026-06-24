import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import AdminActivityActions from "./AdminActivityActions";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "ฉบับร่าง",
  PUBLISHED: "เผยแพร่",
  CANCELLED: "ยกเลิก",
  COMPLETED: "เสร็จสิ้น",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  CANCELLED: "destructive",
  COMPLETED: "outline",
};

export default async function AdminActivitiesPage() {
  const activities = await prisma.activity.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      title: true,
      startDate: true,
      status: true,
      maxSeats: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-charcoal sm:text-2xl">กิจกรรม</h1>
          <Button asChild>
            <Link href="/admin/activities/create">
              <Plus className="mr-1 size-4" />
              สร้างกิจกรรม
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-sepia-pale/60 bg-white">
          <table className="min-w-[640px] w-full text-sm">
            <thead>
              <tr className="border-b border-sepia-pale/40 bg-sepia-cream/60 text-left">
                <th className="px-4 py-3 font-medium text-sepia-mid">ชื่อกิจกรรม</th>
                <th className="px-4 py-3 font-medium text-sepia-mid">วันที่</th>
                <th className="px-4 py-3 font-medium text-sepia-mid">สถานะ</th>
                <th className="px-4 py-3 font-medium text-sepia-mid">ผู้จอง</th>
                <th className="px-4 py-3 font-medium text-sepia-mid"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sepia-pale/30">
              {activities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    ยังไม่มีกิจกรรม
                  </td>
                </tr>
              )}
              {activities.map((a) => (
                <tr key={a.id} className="hover:bg-sepia-cream/20">
                  <td className="px-4 py-3 font-medium text-charcoal">{a.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.startDate.toLocaleDateString("th-TH", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[a.status]}>
                      {STATUS_LABEL[a.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a._count.registrations}
                    {a.maxSeats ? ` / ${a.maxSeats}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/activities/${a.id}/registrations`}>
                          <Users className="size-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/activities/${a.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <AdminActivityActions
                        activityId={a.id}
                        status={a.status}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
