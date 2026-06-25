import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getDonationSlipUrl } from "@/lib/supabase-storage";

const ALLOWED = ["ADMIN", "SUPER_ADMIN"];
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ALLOWED.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const { id } = await params;
  const donation = await prisma.donation.findUnique({
    where: { id, deletedAt: null },
    select: { slipUrl: true },
  });

  if (!donation) return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 });
  if (!donation.slipUrl) return NextResponse.json({ error: "ไม่มีไฟล์สลิป" }, { status: 404 });

  const signedUrl = await getDonationSlipUrl(donation.slipUrl);
  return NextResponse.json({ url: signedUrl });
}
