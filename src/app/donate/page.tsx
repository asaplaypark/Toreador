import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Download, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DonationForm from "./DonationForm";

const FUNDS = [
  {
    id: "KATANYU",
    name: "กองทุนกตัญญูครูสถา",
    purpose: "สนับสนุนคณาจารย์และบุคลากรคณะสถาปัตยกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    bank: "ธนาคารกรุงไทย สาขาสยามสแควร์",
    account: "052-0-62345-2",
    accountName: "กองทุนกตัญญูครูสถา",
    qr: "/qr-katanyu.jpg",
  },
  {
    id: "STACARE",
    name: "กองทุนสถาอาทร",
    purpose: "ช่วยเหลือนิสิตและศิษย์เก่าในยามที่ต้องการ",
    bank: "ธนาคารกรุงไทย สาขาสยามสแควร์ (อาคารสยามกิตติ์)",
    account: "052-0-68064-2",
    accountName: "กองทุนสถาอาทร",
    qr: "/qr-stacare.jpg",
  },
];

export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ fund?: string }>;
}) {
  const [session, params] = await Promise.all([
    getServerSession(authOptions),
    searchParams,
  ]);

  const defaultFund = params.fund && ["KATANYU", "STACARE"].includes(params.fund)
    ? params.fund
    : undefined;

  let defaultName = "";
  let defaultEmail = session?.user?.email ?? "";

  if (session?.user?.id) {
    const member = await prisma.member.findUnique({
      where: { userId: session.user.id, deletedAt: null },
      select: { firstNameTh: true, lastNameTh: true },
    });
    if (member) defaultName = `${member.firstNameTh} ${member.lastNameTh}`;
  }

  return (
    <div className="flex-1 bg-sepia-bg">
      {/* Header */}
      <div className="bg-sepia-dark px-4 py-12 text-center">
        <div className="mx-auto max-w-2xl">
          <Heart className="mx-auto mb-3 size-8 text-sepia-pale" />
          <h1 className="text-2xl font-medium text-white sm:text-3xl">สนับสนุนกองทุนสมาคมฯ</h1>
          <p className="mt-2 text-sm leading-relaxed text-sepia-pale">
            การบริจาคของคุณช่วยสนับสนุนคณาจารย์ นิสิต และกิจกรรมของสมาคมนิสิตเก่าคณะสถาปัตยกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
        {/* Fund cards */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-charcoal">เลือกกองทุนที่ต้องการสนับสนุน</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {FUNDS.map((fund) => (
              <Card key={fund.id} className="overflow-hidden">
                <CardHeader className="bg-sepia-cream/60 pb-4">
                  <CardTitle className="text-base font-semibold text-sepia-dark">{fund.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{fund.purpose}</p>
                </CardHeader>
                <CardContent className="space-y-5 pt-5">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="overflow-hidden rounded-xl border border-sepia-pale/60 bg-white p-3 shadow-sm">
                      <Image
                        src={fund.qr}
                        alt={`QR Code ${fund.name}`}
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Bank info */}
                  <div className="space-y-1.5 rounded-lg bg-sepia-cream/50 px-4 py-3 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">ชื่อบัญชี</span>
                      <span className="font-medium text-charcoal text-right">{fund.accountName}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">ธนาคาร</span>
                      <span className="font-medium text-charcoal text-right">{fund.bank}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">เลขบัญชี</span>
                      <span className="font-mono font-semibold text-sepia tracking-wider">{fund.account}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <a href={fund.qr} download={`qr-${fund.id.toLowerCase()}.jpg`}>
                      <Button variant="outline" className="w-full gap-2">
                        <Download className="size-4" />
                        ดาวน์โหลด QR Code
                      </Button>
                    </a>
                    <Link href={`/donate?fund=${fund.id}#form`}>
                      <Button className="w-full gap-2 bg-sepia hover:bg-sepia-dark">
                        <Heart className="size-4" />
                        แจ้งการบริจาค
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Donation form */}
        <section id="form" className="scroll-mt-20">
          <h2 className="mb-4 text-lg font-medium text-charcoal">แจ้งหลักฐานการโอนเงิน</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            หลังจากโอนเงินแล้ว กรุณากรอกข้อมูลและแนบสลิปเพื่อให้สมาคมฯ ยืนยันการบริจาค
          </p>
          <div className="max-w-2xl">
            <DonationForm
              defaultFund={defaultFund}
              defaultName={defaultName}
              defaultEmail={defaultEmail}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
