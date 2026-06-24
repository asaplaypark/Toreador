import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Users } from "lucide-react";

function formatDate(d: Date) {
  return d.toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;
  const now = new Date();

  const dateFilter =
    filter === "past"
      ? { startDate: { lt: now } }
      : { startDate: { gte: now } };

  const activities = await prisma.activity.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      ...(isLoggedIn ? {} : { allowGuestView: true }),
      ...dateFilter,
    },
    select: {
      slug: true,
      title: true,
      coverImage: true,
      location: true,
      startDate: true,
      maxSeats: true,
      requireRegistration: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { startDate: filter === "past" ? "desc" : "asc" },
  });

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium text-charcoal">กิจกรรม</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              กิจกรรมและงานต่างๆ ของสมาคม
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              variant={!filter || filter === "upcoming" ? "default" : "outline"}
              size="sm"
            >
              <Link href="/activities?filter=upcoming">กำลังจะมา</Link>
            </Button>
            <Button
              asChild
              variant={filter === "past" ? "default" : "outline"}
              size="sm"
            >
              <Link href="/activities?filter=past">ผ่านมาแล้ว</Link>
            </Button>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="rounded-lg border border-sepia-pale/60 bg-white py-16 text-center text-muted-foreground">
            ไม่มีกิจกรรมในขณะนี้
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((a) => {
              const isFull =
                a.requireRegistration &&
                a.maxSeats !== null &&
                a._count.registrations >= a.maxSeats;
              const seatsLeft =
                a.maxSeats !== null ? a.maxSeats - a._count.registrations : null;

              return (
                <Link
                  key={a.slug}
                  href={`/activities/${a.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-sepia-pale/60 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-sepia-cream">
                    {a.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.coverImage}
                        alt={a.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <CalendarDays className="size-10 text-sepia-pale" />
                      </div>
                    )}
                    {isFull && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Badge className="bg-destructive text-white">เต็มแล้ว</Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h3 className="line-clamp-2 font-medium text-charcoal transition-colors group-hover:text-sepia">
                      {a.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5 shrink-0" />
                      {formatDate(a.startDate)}
                    </div>
                    {a.location && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="line-clamp-1">{a.location}</span>
                      </div>
                    )}
                    {a.requireRegistration && (
                      <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
                        <Users className="size-3.5 shrink-0" />
                        {seatsLeft !== null
                          ? isFull
                            ? "ที่นั่งเต็มแล้ว"
                            : `ว่าง ${seatsLeft} ที่นั่ง`
                          : `${a._count.registrations} คนจอง`}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
