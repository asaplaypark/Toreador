import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonationStatus } from "@prisma/client";
import DonationActions from "./DonationActions";

const FUND_LABELS = { KATANYU: "กองทุนกตัญญูครูสถา", STACARE: "กองทุนสถาอาทร" };

function StatusBadge({ status }: { status: DonationStatus }) {
  if (status === "CONFIRMED") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">ยืนยันแล้ว</Badge>;
  if (status === "REJECTED") return <Badge variant="destructive">ปฏิเสธ</Badge>;
  return <Badge variant="outline" className="border-amber-400 text-amber-700">รอยืนยัน</Badge>;
}

export default async function AdminDonationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const donation = await prisma.donation.findUnique({
    where: { id, deletedAt: null },
    include: {
      member: { select: { firstNameTh: true, lastNameTh: true } },
      confirmedBy: { select: { email: true } },
    },
  });

  if (!donation) notFound();

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/donations">
              <ArrowLeft className="mr-1 size-4" />
              กลับ
            </Link>
          </Button>
          <h1 className="flex-1 text-xl font-medium text-charcoal">{donation.donorName}</h1>
          <StatusBadge status={donation.status} />
        </div>

        {/* Actions (only for PENDING) */}
        {donation.status === "PENDING" && (
          <DonationActions donationId={donation.id} />
        )}

        {/* Rejection reason */}
        {donation.status === "REJECTED" && donation.rejectReason && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-4 text-sm text-destructive">
              <strong>เหตุผลที่ปฏิเสธ:</strong> {donation.rejectReason}
            </CardContent>
          </Card>
        )}

        {/* Donation info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
              ข้อมูลการบริจาค
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="กองทุน">{FUND_LABELS[donation.fund] ?? donation.fund}</Row>
            <Row label="จำนวนเงิน">
              <span className="text-lg font-semibold text-sepia">
                ฿{Number(donation.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </span>
            </Row>
            <Row label="วันที่แจ้ง">
              {donation.createdAt.toLocaleDateString("th-TH", {
                year: "numeric", month: "long", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </Row>
            {donation.note && <Row label="หมายเหตุ">{donation.note}</Row>}
          </CardContent>
        </Card>

        {/* Donor info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
              ข้อมูลผู้บริจาค
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="ชื่อ">{donation.donorName}</Row>
            {donation.donorEmail && <Row label="อีเมล">{donation.donorEmail}</Row>}
            {donation.donorPhone && <Row label="โทรศัพท์">{donation.donorPhone}</Row>}
            {donation.member && (
              <Row label="สมาชิก">
                {donation.member.firstNameTh} {donation.member.lastNameTh}
              </Row>
            )}
          </CardContent>
        </Card>

        {/* Slip */}
        {donation.slipUrl && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
                หลักฐานการโอนเงิน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SlipViewer donationId={donation.id} />
            </CardContent>
          </Card>
        )}

        {/* Confirmed by */}
        {donation.status === "CONFIRMED" && donation.confirmedBy && (
          <Card>
            <CardContent className="pt-4 text-sm text-muted-foreground">
              ยืนยันโดย {donation.confirmedBy.email} เมื่อ{" "}
              {donation.confirmedAt?.toLocaleDateString("th-TH", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
      <span className="text-charcoal">{children}</span>
    </div>
  );
}

// Client component for lazy-loading the signed URL
function SlipViewer({ donationId }: { donationId: string }) {
  return <SlipViewerClient donationId={donationId} />;
}

// We import it inline so it stays in the same file
import SlipViewerClient from "./SlipViewerClient";
