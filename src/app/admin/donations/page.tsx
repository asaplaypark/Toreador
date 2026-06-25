import { prisma } from "@/lib/prisma";
import { DonationFund, DonationStatus, Prisma } from "@prisma/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DonationStatusFilter from "./DonationStatusFilter";
import Pagination from "@/components/Pagination";

const PER_PAGE = 25;

const FUND_LABELS: Record<DonationFund, string> = {
  KATANYU: "กตัญญูครูสถา",
  STACARE: "สถาอาทร",
};

const STATUS_LABELS: Record<DonationStatus, string> = {
  PENDING: "รอยืนยัน",
  CONFIRMED: "ยืนยันแล้ว",
  REJECTED: "ปฏิเสธ",
};

function StatusBadge({ status }: { status: DonationStatus }) {
  if (status === "CONFIRMED") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">ยืนยันแล้ว</Badge>;
  if (status === "REJECTED") return <Badge variant="destructive">ปฏิเสธ</Badge>;
  return <Badge variant="outline" className="border-amber-400 text-amber-700">รอยืนยัน</Badge>;
}

type SearchParams = { fund?: string; status?: string; page?: string };

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { fund, status, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const where: Prisma.DonationWhereInput = {
    deletedAt: null,
    ...(fund && Object.values(DonationFund).includes(fund as DonationFund)
      ? { fund: fund as DonationFund }
      : {}),
    ...(status && Object.values(DonationStatus).includes(status as DonationStatus)
      ? { status: status as DonationStatus }
      : {}),
  };

  const [total, donations, totals] = await Promise.all([
    prisma.donation.count({ where }),
    prisma.donation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        donorName: true,
        donorEmail: true,
        fund: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.donation.groupBy({
      by: ["fund"],
      where: { status: "CONFIRMED", deletedAt: null },
      _sum: { amount: true },
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  const totalMap = Object.fromEntries(
    totals.map((t) => [t.fund, Number(t._sum.amount ?? 0)])
  );

  const paginationParams: Record<string, string> = {};
  if (fund) paginationParams.fund = fund;
  if (status) paginationParams.status = status;

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">จัดการบริจาค</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total === 0 ? "ไม่พบรายการ" : `แสดง ${from}–${to} จาก ${total} รายการ`}
          </p>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-4">
          {Object.values(DonationFund).map((f) => (
            <Card key={f}>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  กองทุน{FUND_LABELS[f]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-sepia">
                  ฿{(totalMap[f] ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">ยอดบริจาคที่ยืนยันแล้ว</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <DonationStatusFilter currentFund={fund ?? ""} currentStatus={status ?? ""} />

        <div className="overflow-x-auto rounded-lg border border-sepia-pale/60 bg-white">
          {donations.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">ไม่พบรายการบริจาค</p>
          ) : (
            <table className="min-w-[600px] w-full text-sm">
              <thead className="border-b border-sepia-pale/60 bg-sepia-cream/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-sepia-mid">ชื่อผู้บริจาค</th>
                  <th className="px-4 py-3 text-left font-medium text-sepia-mid">กองทุน</th>
                  <th className="px-4 py-3 text-right font-medium text-sepia-mid">จำนวน (บาท)</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-sepia-mid sm:table-cell">วันที่</th>
                  <th className="px-4 py-3 text-left font-medium text-sepia-mid">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sepia-pale/40">
                {donations.map((d) => (
                  <tr key={d.id} className="transition-colors hover:bg-sepia-bg/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/donations/${d.id}`}
                        className="font-medium text-charcoal underline-offset-4 hover:text-sepia hover:underline"
                      >
                        {d.donorName}
                      </Link>
                      {d.donorEmail && (
                        <p className="text-xs text-muted-foreground">{d.donorEmail}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {FUND_LABELS[d.fund]}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-charcoal">
                      {Number(d.amount).toLocaleString("th-TH")}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {d.createdAt.toLocaleDateString("th-TH", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/admin/donations"
          searchParams={paginationParams}
        />
      </div>
    </div>
  );
}
