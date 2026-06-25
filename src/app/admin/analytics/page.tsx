import { prisma } from "@/lib/prisma";
import { DEPARTMENT_LABELS } from "@/lib/departments";
import {
  DeptBarChart,
  GenerationBarChart,
  AgeRangeChart,
  TopActivitiesChart,
  DonationMonthlyChart,
  MemberGrowthChart,
  type DeptData,
  type GenData,
  type AgeData,
  type ActivityData,
  type MonthlyDonationData,
  type GrowthData,
} from "./AnalyticsCharts";

// ── helpers ────────────────────────────────────────────────────────────────
function thMonth(date: Date) {
  return date.toLocaleDateString("th-TH", { year: "2-digit", month: "short" });
}

function ageFromBirthDate(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

function SummaryCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-sepia-pale/60 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-sepia-mid">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accent ?? "text-charcoal"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-sepia-pale/60 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-charcoal">{title}</h3>
      {children}
    </div>
  );
}

export default async function AnalyticsPage() {
  const now = new Date();

  // ── Section 1: Members ───────────────────────────────────────────────────
  const [
    totalActive,
    selfRegistered,
    imported,
    pending,
    deptGroups,
    genGroups,
    allBirthDates,
  ] = await Promise.all([
    prisma.member.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.member.count({ where: { status: "ACTIVE", dataSource: "SELF_REGISTERED", deletedAt: null } }),
    prisma.member.count({ where: { status: "ACTIVE", dataSource: "IMPORTED", deletedAt: null } }),
    prisma.member.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.member.groupBy({
      by: ["department"],
      where: { status: "ACTIVE", deletedAt: null },
      _count: { _all: true },
      orderBy: { _count: { department: "desc" } },
    }),
    prisma.member.groupBy({
      by: ["yearOfEntry"],
      where: { status: "ACTIVE", deletedAt: null },
      _count: { _all: true },
      orderBy: { yearOfEntry: "asc" },
    }),
    prisma.member.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      select: { birthDate: true },
    }),
  ]);

  // Department data
  const deptData: DeptData[] = deptGroups.map((g) => ({
    dept: g.department,
    label: DEPARTMENT_LABELS[g.department as keyof typeof DEPARTMENT_LABELS] ?? g.department,
    count: g._count._all,
    pct: totalActive > 0 ? Math.round((g._count._all / totalActive) * 100) : 0,
  }));

  // Generation data
  const genData: GenData[] = genGroups.map((g) => ({
    gen: g.yearOfEntry - 2475,
    label: `รุ่น ${g.yearOfEntry - 2475}`,
    count: g._count._all,
  }));

  // Age range data
  const ageBuckets = { "<30": 0, "30-40": 0, "40-50": 0, "50-60": 0, ">60": 0 };
  for (const { birthDate } of allBirthDates) {
    const age = ageFromBirthDate(birthDate);
    if (age < 30) ageBuckets["<30"]++;
    else if (age < 40) ageBuckets["30-40"]++;
    else if (age < 50) ageBuckets["40-50"]++;
    else if (age < 60) ageBuckets["50-60"]++;
    else ageBuckets[">60"]++;
  }
  const ageData: AgeData[] = Object.entries(ageBuckets).map(([range, count]) => ({ range: `${range} ปี`, count }));

  // ── Section 2: Activities ────────────────────────────────────────────────
  const [
    totalActivities,
    upcomingActivities,
    totalRegistrations,
    topActivities,
  ] = await Promise.all([
    prisma.activity.count({ where: { deletedAt: null } }),
    prisma.activity.count({
      where: { deletedAt: null, status: "PUBLISHED", startDate: { gte: now } },
    }),
    prisma.activityRegistration.count(),
    prisma.activity.findMany({
      where: { deletedAt: null },
      select: { title: true, _count: { select: { registrations: true } } },
      orderBy: { registrations: { _count: "desc" } },
      take: 5,
    }),
  ]);

  const pastActivities = totalActivities - upcomingActivities;

  const activityData: ActivityData[] = topActivities
    .filter((a) => a._count.registrations > 0)
    .map((a) => ({ title: a.title, count: a._count.registrations }));

  // ── Section 3: Donations ─────────────────────────────────────────────────
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [donationTotals, pendingDonations, recentDonations] = await Promise.all([
    prisma.donation.groupBy({
      by: ["fund"],
      where: { status: "CONFIRMED", deletedAt: null },
      _sum: { amount: true },
    }),
    prisma.donation.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.donation.findMany({
      where: { status: "CONFIRMED", deletedAt: null, createdAt: { gte: sixMonthsAgo } },
      select: { fund: true, amount: true, createdAt: true },
    }),
  ]);

  const totalDonated = donationTotals.reduce((s, g) => s + Number(g._sum.amount ?? 0), 0);
  const katanyuTotal = Number(donationTotals.find((g) => g.fund === "KATANYU")?._sum.amount ?? 0);
  const stacareTotal = Number(donationTotals.find((g) => g.fund === "STACARE")?._sum.amount ?? 0);

  // Build 6-month grid
  const monthGrid: MonthlyDonationData[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    monthGrid.push({ month: thMonth(d), KATANYU: 0, STACARE: 0 });
  }
  for (const don of recentDonations) {
    const label = thMonth(don.createdAt);
    const slot = monthGrid.find((m) => m.month === label);
    if (slot) {
      if (don.fund === "KATANYU") slot.KATANYU += Number(don.amount);
      else slot.STACARE += Number(don.amount);
    }
  }

  // ── Section 4: Growth ────────────────────────────────────────────────────
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [membersBefore, membersInPeriod] = await Promise.all([
    prisma.member.count({
      where: { status: "ACTIVE", deletedAt: null, createdAt: { lt: twelveMonthsAgo } },
    }),
    prisma.member.findMany({
      where: { status: "ACTIVE", deletedAt: null, createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Build 12-month cumulative
  const growthData: GrowthData[] = [];
  let running = membersBefore;
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const monthLabel = thMonth(d);
    const year = d.getFullYear();
    const month = d.getMonth();
    const added = membersInPeriod.filter((m) => {
      return m.createdAt.getFullYear() === year && m.createdAt.getMonth() === month;
    }).length;
    running += added;
    growthData.push({ month: monthLabel, total: running });
  }

  const fmt = (n: number) =>
    `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">วิเคราะห์ข้อมูล</h1>
          <p className="mt-1 text-sm text-muted-foreground">ภาพรวมระบบ ณ วันที่{" "}
            {now.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* ── Section 1: Members ── */}
        <section className="space-y-5">
          <h2 className="text-base font-medium text-sepia-dark border-b border-sepia-pale/40 pb-2">
            สมาชิก
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard label="สมาชิกทั้งหมด" value={totalActive.toLocaleString()} accent="text-sepia-dark" />
            <SummaryCard label="สมัครเอง" value={selfRegistered.toLocaleString()} sub="SELF_REGISTERED" />
            <SummaryCard label="นำเข้าจาก Sheet" value={imported.toLocaleString()} sub="IMPORTED" />
            <SummaryCard
              label="รอการอนุมัติ"
              value={pending.toLocaleString()}
              accent={pending > 0 ? "text-amber-600" : "text-charcoal"}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ChartCard title="สมาชิกแยกตามภาควิชา">
              {deptData.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">ไม่มีข้อมูล</p>
              ) : (
                <DeptBarChart data={deptData} />
              )}
            </ChartCard>

            <ChartCard title="การกระจายอายุ">
              {allBirthDates.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">ไม่มีข้อมูล</p>
              ) : (
                <AgeRangeChart data={ageData} />
              )}
            </ChartCard>
          </div>

          <ChartCard title="สมาชิกแยกตามรุ่น">
            {genData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">ไม่มีข้อมูล</p>
            ) : (
              <GenerationBarChart data={genData} />
            )}
          </ChartCard>
        </section>

        {/* ── Section 2: Activities ── */}
        <section className="space-y-5">
          <h2 className="text-base font-medium text-sepia-dark border-b border-sepia-pale/40 pb-2">
            กิจกรรม
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard label="กิจกรรมทั้งหมด" value={totalActivities.toLocaleString()} />
            <SummaryCard label="กำลังจะมา" value={upcomingActivities.toLocaleString()} accent="text-sepia-dark" />
            <SummaryCard label="ผ่านมาแล้ว" value={pastActivities.toLocaleString()} />
            <SummaryCard label="ผู้จองทั้งหมด" value={totalRegistrations.toLocaleString()} sub="ทุกกิจกรรม" />
          </div>

          <ChartCard title="5 กิจกรรมที่มีผู้จองมากสุด">
            {activityData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีผู้จอง</p>
            ) : (
              <TopActivitiesChart data={activityData} />
            )}
          </ChartCard>
        </section>

        {/* ── Section 3: Donations ── */}
        <section className="space-y-5">
          <h2 className="text-base font-medium text-sepia-dark border-b border-sepia-pale/40 pb-2">
            บริจาค
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard label="ยอดรวม (ยืนยัน)" value={fmt(totalDonated)} accent="text-sepia-dark" />
            <SummaryCard label="กตัญญูครูสถา" value={fmt(katanyuTotal)} />
            <SummaryCard label="สถาอาทร" value={fmt(stacareTotal)} />
            <SummaryCard
              label="รอการยืนยัน"
              value={pendingDonations.toLocaleString()}
              sub="รายการ"
              accent={pendingDonations > 0 ? "text-amber-600" : "text-charcoal"}
            />
          </div>

          <ChartCard title="บริจาครายเดือน (6 เดือนล่าสุด)">
            <DonationMonthlyChart data={monthGrid} />
          </ChartCard>
        </section>

        {/* ── Section 4: Growth ── */}
        <section className="space-y-5">
          <h2 className="text-base font-medium text-sepia-dark border-b border-sepia-pale/40 pb-2">
            การเติบโต
          </h2>

          <ChartCard title="สมาชิกสะสมรายเดือน (12 เดือนล่าสุด)">
            <MemberGrowthChart data={growthData} />
          </ChartCard>
        </section>
      </div>
    </div>
  );
}
