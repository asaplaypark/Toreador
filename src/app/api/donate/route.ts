import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadDonationSlip } from "@/lib/supabase-storage";
import { sendDonationReceivedEmail } from "@/lib/email/templates/donationReceived";
import { DonationFund } from "@prisma/client";

const VALID_FUNDS = Object.values(DonationFund) as string[];
const MAX_SIZE = 5 * 1024 * 1024;
const IS_DEV = process.env.NODE_ENV === "development";

function errResponse(step: string, err: unknown, status = 500) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[/api/donate] ${step}:`, err);
  return NextResponse.json(
    {
      error: "เกิดข้อผิดพลาดในระบบ",
      ...(IS_DEV ? { _debug: { step, message: msg } } : {}),
    },
    { status }
  );
}

export async function POST(req: Request) {
  // ── 1. Parse FormData ──────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    return errResponse("parseFormData", err);
  }

  const donorName = (formData.get("donorName") as string | null)?.trim();
  const donorEmail = (formData.get("donorEmail") as string | null)?.trim().toLowerCase();
  const donorPhone = (formData.get("donorPhone") as string | null)?.trim() || null;
  const fund = formData.get("fund") as string | null;
  const amountRaw = formData.get("amount") as string | null;
  const note = (formData.get("note") as string | null)?.trim() || null;
  const slip = formData.get("slip");

  console.log("[/api/donate] fields:", {
    donorName,
    donorEmail,
    fund,
    amountRaw,
    slipType: slip instanceof File ? slip.type : typeof slip,
    slipSize: slip instanceof File ? slip.size : null,
  });

  // ── 2. Validate ────────────────────────────────────────────────────────────
  if (!donorName) return NextResponse.json({ error: "กรุณากรอกชื่อผู้บริจาค" }, { status: 400 });
  if (!donorEmail) return NextResponse.json({ error: "กรุณากรอกอีเมล" }, { status: 400 });
  if (!fund || !VALID_FUNDS.includes(fund))
    return NextResponse.json({ error: "กรุณาเลือกกองทุน" }, { status: 400 });
  const amount = parseFloat(amountRaw ?? "");
  if (!amount || amount <= 0)
    return NextResponse.json({ error: "กรุณากรอกจำนวนเงิน" }, { status: 400 });
  if (!(slip instanceof File))
    return NextResponse.json({ error: "กรุณาแนบสลิปการโอนเงิน" }, { status: 400 });
  if (slip.size > 0 && !slip.type.startsWith("image/"))
    return NextResponse.json({ error: "สลิปต้องเป็นไฟล์รูปภาพ (jpg, png)" }, { status: 400 });
  if (slip.size > MAX_SIZE)
    return NextResponse.json({ error: "ขนาดไฟล์ต้องไม่เกิน 5MB" }, { status: 400 });

  // ── 3. Resolve member ──────────────────────────────────────────────────────
  let memberId: string | null = null;
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const member = await prisma.member.findUnique({
        where: { userId: session.user.id, deletedAt: null },
        select: { id: true },
      });
      memberId = member?.id ?? null;
    }
  } catch (err) {
    return errResponse("resolveSession", err);
  }

  // ── 4. Create DB record ────────────────────────────────────────────────────
  let donationId: string;
  try {
    const donation = await prisma.donation.create({
      data: {
        memberId,
        donorName,
        donorEmail,
        donorPhone,
        fund: fund as DonationFund,
        amount,
        note,
        status: "PENDING",
      },
    });
    donationId = donation.id;
    console.log("[/api/donate] created donation:", donationId);
  } catch (err) {
    return errResponse("prisma.donation.create", err);
  }

  // ── 5. Upload slip ─────────────────────────────────────────────────────────
  try {
    const slipPath = await uploadDonationSlip(slip, donationId);
    await prisma.donation.update({ where: { id: donationId }, data: { slipUrl: slipPath } });
    console.log("[/api/donate] slip uploaded:", slipPath);
  } catch (err) {
    // Don't fail — admin can follow up manually
    console.error("[/api/donate] slip upload failed (non-fatal):", err);
  }

  // ── 6. Email (fire-and-forget) ─────────────────────────────────────────────
  void sendDonationReceivedEmail({ donorName, email: donorEmail, fund, amount });

  return NextResponse.json({ success: true, id: donationId }, { status: 201 });
}
