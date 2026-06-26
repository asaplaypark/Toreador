import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { sanitizeHtml } from "@/lib/sanitize";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, CalendarDays, MapPin, Heart } from "lucide-react";

export default async function LandingPage() {
  const [settings, session, memberCount, distinctGens, latestNews] =
    await Promise.all([
      getSiteSettings(),
      getServerSession(authOptions),
      prisma.member.count({ where: { status: "ACTIVE", deletedAt: null } }),
      prisma.member.groupBy({
        by: ["yearOfEntry"],
        where: { status: "ACTIVE", deletedAt: null },
      }),
      prisma.news.findMany({
        where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null },
        select: {
          slug: true,
          title: true,
          excerpt: true,
          coverImage: true,
          category: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
    ]);

  const isLoggedInForActivities = !!session?.user?.id;
  const upcomingActivities = await prisma.activity.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      startDate: { gte: new Date() },
      ...(isLoggedInForActivities
        ? {}
        : { allowGuestView: true, visibility: "PUBLIC" }),
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
    orderBy: { startDate: "asc" },
    take: 3,
  });

  const isLoggedIn = !!session?.user?.id;
  let memberName = "";
  if (isLoggedIn) {
    const member = await prisma.member.findUnique({
      where: { userId: session!.user.id },
      select: { firstNameTh: true },
    });
    memberName = member?.firstNameTh ?? "";
  }

  const genCount = distinctGens.length;
  const foundedYear = settings.founded_year || "2475";
  const heroTitle = settings.hero_title || "ยินดีต้อนรับสู่สมาคมนิสิตเก่า สถาปัตย์ จุฬาฯ";
  const heroSubtitle =
    settings.hero_subtitle ||
    "เชื่อมต่อ แบ่งปัน และสร้างสรรค์ร่วมกันในฐานะนิสิตเก่าของคณะ";
  const heroImage = settings.hero_image || "";
  const aboutTitle = settings.about_title || "เกี่ยวกับสมาคม";
  const aboutContent = settings.about_content || "";

  // Total generations: base 88 at Aug 2568, +1 every August
  const now = new Date();
  const currentBuddhistYear = now.getFullYear() + 543;
  const effectiveYear = now.getMonth() >= 7 ? currentBuddhistYear : currentBuddhistYear - 1;
  const totalGens = 88 + (effectiveYear - 2568);

  const stats = [
    { label: "สมาชิกที่ลงทะเบียน", value: memberCount.toLocaleString(), Icon: Users },
    { label: "รุ่นในระบบ / ทั้งหมด", value: `${genCount}/${totalGens}`, Icon: BookOpen },
    { label: "ปีที่ก่อตั้ง", value: `พ.ศ. ${foundedYear}`, Icon: CalendarDays },
  ];

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Hero ── */}
      <section
        className="relative flex min-h-[60vh] items-center justify-center overflow-hidden"
        style={{
          backgroundColor: "var(--sepia-dark)",
          ...(heroImage
            ? {
                backgroundImage: `url(${heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
        }}
      >
        {heroImage && (
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(61,31,0,0.72)" }} />
        )}
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center">
          <h1
            className={[
              "font-medium leading-snug text-white",
              heroTitle.length > 20
                ? "text-2xl sm:text-3xl lg:text-4xl"
                : "text-2xl sm:text-3xl lg:text-5xl",
            ].join(" ")}
            style={{ wordBreak: "keep-all", textWrap: "balance" } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(heroTitle) }}
          />
          <p className="mt-4 text-base leading-relaxed text-sepia-cream sm:text-lg">
            {heroSubtitle}
          </p>

          <div className="mt-8">
            {isLoggedIn ? (
              <div className="space-y-2">
                <p className="text-sepia-pale text-sm">ยินดีต้อนรับกลับ</p>
                <p className="text-xl font-medium text-white">
                  {memberName ? `คุณ${memberName}` : session?.user?.email}
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Button asChild className="bg-sepia-cream text-sepia hover:bg-sepia-pale">
                    <Link href="/dashboard">ไปที่แดชบอร์ด</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-[#3D1F00]">
                    <Link href="/members">ทำเนียบสมาชิก</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="w-full bg-sepia-cream text-sepia hover:bg-sepia-pale sm:w-auto">
                  <Link href="/register">สมัครสมาชิก</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full border-white/50 text-white hover:bg-white/10 sm:w-auto"
                >
                  <Link href="/login">เข้าสู่ระบบ</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-sepia-cream">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-0 divide-x divide-sepia-pale/60 px-4">
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-4 py-8 text-center">
              <Icon className="mb-1 size-5 text-sepia-mid" />
              <p className="text-2xl font-semibold text-sepia sm:text-3xl">{value}</p>
              <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      {aboutContent && (
        <section className="bg-sepia-bg px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-medium text-charcoal">{aboutTitle}</h2>
            <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
              {aboutContent}
            </p>
          </div>
        </section>
      )}

      {/* ── Latest News ── */}
      {latestNews.length > 0 && (
        <section className="bg-white px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-medium text-charcoal">ข่าวสารล่าสุด</h2>
              <Button asChild variant="outline">
                <Link href="/news">ดูข่าวทั้งหมด</Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestNews.map((news) => (
                <Link
                  key={news.slug}
                  href={`/news/${news.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-sepia-pale/60 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
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
                        <span className="text-3xl font-semibold text-sepia-pale select-none">T</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    {news.category && (
                      <Badge variant="outline" className="w-fit text-xs">{news.category}</Badge>
                    )}
                    <h3 className="line-clamp-2 font-medium text-charcoal transition-colors group-hover:text-sepia">
                      {news.title}
                    </h3>
                    {news.excerpt && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{news.excerpt}</p>
                    )}
                    {news.publishedAt && (
                      <p className="mt-auto pt-2 text-xs text-muted-foreground">
                        {news.publishedAt.toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Upcoming Activities ── */}
      {upcomingActivities.length > 0 && (
        <section className="bg-sepia-cream/50 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-medium text-charcoal">กิจกรรมที่กำลังจะมา</h2>
              <Button asChild variant="outline">
                <Link href="/activities">ดูกิจกรรมทั้งหมด</Link>
              </Button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingActivities.map((a) => {
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
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5 shrink-0" />
                        {a.startDate.toLocaleDateString("th-TH", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                      </p>
                      {a.location && (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="line-clamp-1">{a.location}</span>
                        </p>
                      )}
                      {a.requireRegistration && seatsLeft !== null && !isFull && (
                        <p className="mt-auto pt-2 text-xs text-muted-foreground">
                          ว่าง {seatsLeft} ที่นั่ง
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
      {/* ── Donation Funds ── */}
      <section
        className="px-4 py-16"
        style={{ background: "linear-gradient(135deg, #C4783A 0%, #D4A853 100%)" }}
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <Heart className="mx-auto mb-3 size-7 text-white/70" />
            <h2 className="text-2xl font-medium text-white">สนับสนุนกองทุน</h2>
            <p className="mt-2 text-sm text-white/85">
              ร่วมสนับสนุนกองทุนเพื่อคณาจารย์ นิสิต และสมาชิกสมาคมฯ
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                id: "KATANYU",
                name: "กองทุนกตัญญูครูสถา",
                desc: "สนับสนุนคณาจารย์และบุคลากรคณะสถาปัตยกรรมศาสตร์",
                account: "052-0-62345-2",
              },
              {
                id: "STACARE",
                name: "กองทุนสถาอาทร",
                desc: "ช่วยเหลือนิสิตและศิษย์เก่าในยามที่ต้องการ",
                account: "052-0-68064-2",
              },
            ].map((fund) => (
              <div
                key={fund.id}
                className="rounded-xl border border-white/20 bg-white/15 p-6 backdrop-blur-sm"
              >
                <h3 className="font-semibold text-lg text-white">{fund.name}</h3>
                <p className="mt-1 text-sm text-white/85">{fund.desc}</p>
                <p className="mt-3 font-mono text-white/70 text-sm tracking-widest">{fund.account}</p>
                <Link href={`/donate?fund=${fund.id}#form`} className="mt-4 block">
                  <Button
                    className="w-full gap-2 border-0 text-[#F5E6D3] hover:text-[#F5E6D3]/80"
                    style={{ backgroundColor: "#3D1F00" }}
                  >
                    <Heart className="size-4" />
                    บริจาคเพื่อกองทุนนี้
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/donate">
              <Button variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-[#3D1F00]">
                ดูรายละเอียดและ QR Code
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
