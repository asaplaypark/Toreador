import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ActivityForm from "../../ActivityForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function toDateStr(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}
function toTimeStr(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(11, 16);
}

export default async function AdminActivityEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const activity = await prisma.activity.findUnique({
    where: { id, deletedAt: null },
  });
  if (!activity) notFound();

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/activities">
              <ArrowLeft className="mr-1 size-4" />
              กลับ
            </Link>
          </Button>
          <h1 className="text-xl font-medium text-charcoal">แก้ไขกิจกรรม</h1>
        </div>
        <ActivityForm
          activityId={activity.id}
          initialValues={{
            title: activity.title,
            description: activity.description,
            coverImage: activity.coverImage ?? "",
            location: activity.location ?? "",
            onlineLink: activity.onlineLink ?? "",
            startDate: toDateStr(activity.startDate),
            startTime: toTimeStr(activity.startDate),
            endDate: toDateStr(activity.endDate ?? null),
            endTime: toTimeStr(activity.endDate ?? null),
            registrationDeadline: toDateStr(activity.registrationDeadline ?? null),
            registrationDeadlineTime: toTimeStr(activity.registrationDeadline ?? null),
            maxSeats: activity.maxSeats?.toString() ?? "",
            requireRegistration: activity.requireRegistration,
            allowGuestView: activity.allowGuestView,
            visibility: activity.visibility,
            status: activity.status,
          }}
        />
      </div>
    </div>
  );
}
