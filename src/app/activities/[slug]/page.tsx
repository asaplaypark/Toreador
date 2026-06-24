import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, MapPin, Link as LinkIcon, Users, Clock } from "lucide-react";
import RichTextViewer from "@/components/RichTextViewer";
import RegisterButton from "./RegisterButton";

function formatDate(d: Date) {
  return d.toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;

  const activity = await prisma.activity.findUnique({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
    include: { _count: { select: { registrations: true } } },
  });

  if (!activity) notFound();
  if (activity.visibility === "ADMIN_ONLY") notFound();
  if (activity.visibility === "MEMBERS_ONLY" && !isLoggedIn) notFound();
  if (!activity.allowGuestView && !isLoggedIn) notFound();

  const isFull =
    activity.requireRegistration &&
    activity.maxSeats !== null &&
    activity._count.registrations >= activity.maxSeats;

  const isClosed =
    !!activity.registrationDeadline && activity.registrationDeadline < new Date();

  const seatsLeft =
    activity.maxSeats !== null
      ? activity.maxSeats - activity._count.registrations
      : null;

  // Determine if guest can register (PUBLIC activity only)
  const allowGuestRegister =
    activity.requireRegistration &&
    activity.visibility === "PUBLIC" &&
    activity.allowGuestView;

  // Fetch member data for prefill + registration check
  let isRegistered = false;
  let prefill = { name: "", email: "", phone: "", lineId: "" };

  if (isLoggedIn) {
    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
      select: {
        email: true,
        member: {
          select: {
            id: true,
            firstNameTh: true,
            lastNameTh: true,
            phone: true,
            lineId: true,
          },
        },
      },
    });

    if (user) {
      const m = user.member;
      prefill = {
        name: m ? `${m.firstNameTh} ${m.lastNameTh}` : "",
        email: user.email ?? "",
        phone: m?.phone ?? "",
        lineId: m?.lineId ?? "",
      };

      if (m && activity.requireRegistration) {
        const reg = await prisma.activityRegistration.findUnique({
          where: { activityId_memberId: { activityId: activity.id, memberId: m.id } },
        });
        isRegistered = !!reg;
      }
    }
  }

  const activitySummary = {
    id: activity.id,
    title: activity.title,
    startDateFormatted: formatDate(activity.startDate),
    location: activity.location,
  };

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/activities">
            <ArrowLeft className="mr-1 size-4" />
            กลับไปกิจกรรม
          </Link>
        </Button>

        {/* Cover */}
        {activity.coverImage && (
          <div className="overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activity.coverImage}
              alt={activity.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-xl font-medium leading-snug text-charcoal sm:text-2xl lg:text-3xl">
            {activity.title}
          </h1>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-sepia-mid" />
              <span>{formatDate(activity.startDate)}</span>
              {activity.endDate && <span>— {formatDate(activity.endDate)}</span>}
            </div>
            {activity.location && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-sepia-mid" />
                <span>{activity.location}</span>
              </div>
            )}
            {activity.onlineLink && (
              <div className="flex items-center gap-2">
                <LinkIcon className="size-4 shrink-0 text-sepia-mid" />
                <a
                  href={activity.onlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sepia underline hover:text-sepia-dark"
                >
                  ลิงก์เข้าร่วมออนไลน์
                </a>
              </div>
            )}
            {activity.requireRegistration && (
              <div className="flex items-center gap-2">
                <Users className="size-4 shrink-0 text-sepia-mid" />
                <span>
                  {activity._count.registrations} คนจอง
                  {seatsLeft !== null && ` · ว่าง ${seatsLeft} ที่นั่ง`}
                  {isFull && (
                    <Badge variant="destructive" className="ml-2 text-xs">เต็มแล้ว</Badge>
                  )}
                </span>
              </div>
            )}
            {activity.registrationDeadline && (
              <div className="flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-sepia-mid" />
                <span>ปิดรับจอง {formatDate(activity.registrationDeadline)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Registration CTA */}
        {activity.requireRegistration && (
          <div className="rounded-lg border border-sepia-pale/60 bg-white p-4">
            {isLoggedIn || allowGuestRegister ? (
              <RegisterButton
                activity={activitySummary}
                prefill={prefill}
                isRegistered={isRegistered}
                isFull={isFull}
                isClosed={isClosed}
              />
            ) : (
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                <p className="text-sm text-muted-foreground">
                  กรุณาเข้าสู่ระบบเพื่อลงทะเบียน
                </p>
                <Button asChild size="sm">
                  <Link href="/login">เข้าสู่ระบบ</Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {activity.description && (
          <div className="rounded-lg border border-sepia-pale/60 bg-white p-6">
            <RichTextViewer html={activity.description} className="text-sm" />
          </div>
        )}
      </div>
    </div>
  );
}
