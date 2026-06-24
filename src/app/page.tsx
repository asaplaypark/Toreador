import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { sanitizeHtml } from "@/lib/sanitize";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, CalendarDays } from "lucide-react";

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

  const stats = [
    { label: "สมาชิกทั้งหมด", value: memberCount.toLocaleString(), Icon: Users },
    { label: "จำนวนรุ่น", value: genCount.toLocaleString(), Icon: BookOpen },
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
                  <Button asChild variant="outline" className="border-white/50 text-white hover:bg-white/10">
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
    </div>
  );
}
