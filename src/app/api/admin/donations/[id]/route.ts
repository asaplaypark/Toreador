import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendDonationConfirmedEmail } from "@/lib/email/templates/donationConfirmed";

const ALLOWED = ["ADMIN", "SUPER_ADMIN"];
type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ALLOWED.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json() as { action: "confirm" | "reject"; rejectReason?: string };

  const donation = await prisma.donation.findUnique({ where: { id, deletedAt: null } });
  if (!donation) return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 });
  if (donation.status !== "PENDING")
    return NextResponse.json({ error: "รายการนี้ดำเนินการไปแล้ว" }, { status: 409 });

  if (body.action === "confirm") {
    const updated = await prisma.donation.update({
      where: { id },
      data: {
        status: "CONFIRMED",
        confirmedById: session.user.id,
        confirmedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CONFIRM_DONATION",
        targetType: "Donation",
        targetId: id,
        after: { amount: donation.amount.toString(), fund: donation.fund },
      },
    });

    if (donation.donorEmail) {
      void sendDonationConfirmedEmail({
        donorName: donation.donorName,
        email: donation.donorEmail,
        fund: donation.fund,
        amount: Number(donation.amount),
      });
    }

    return NextResponse.json(updated);
  }

  if (body.action === "reject") {
    if (!body.rejectReason?.trim())
      return NextResponse.json({ error: "กรุณาระบุเหตุผล" }, { status: 400 });

    const updated = await prisma.donation.update({
      where: { id },
      data: { status: "REJECTED", rejectReason: body.rejectReason.trim() },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "REJECT_DONATION",
        targetType: "Donation",
        targetId: id,
        after: { rejectReason: body.rejectReason },
      },
    });

    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "action ไม่ถูกต้อง" }, { status: 400 });
}
