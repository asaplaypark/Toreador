import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { memberRegistrationHtml } from "@/lib/email/templates/memberRegistration";
import { memberApprovedHtml } from "@/lib/email/templates/memberApproved";
import { activityRegistrationHtml } from "@/lib/email/templates/activityRegistration";
import { activityCancellationHtml } from "@/lib/email/templates/activityCancellation";
import { sendEmail } from "@/lib/email/resend";

const ALLOWED = ["ADMIN", "SUPER_ADMIN"];

const MOCK = {
  memberRegistration: {
    subject: "ขอบคุณสำหรับการสมัครสมาชิก — สมาคมนิสิตเก่าสถาปัตย์ จุฬาฯ",
    html: () =>
      memberRegistrationHtml({
        name: "สมชาย ใจดี",
        email: "test@example.com",
        department: "สถาปัตยกรรม",
      }),
  },
  memberApproved: {
    subject: "ยินดีต้อนรับ! การสมัครสมาชิกของคุณได้รับการอนุมัติแล้ว",
    html: () =>
      memberApprovedHtml({ name: "สมชาย ใจดี", email: "test@example.com" }),
  },
  activityRegistration: {
    subject: "ยืนยันการลงทะเบียน — งานรวมรุ่นสถาปัตย์ประจำปี 2568",
    html: () =>
      activityRegistrationHtml({
        registrantName: "สมชาย ใจดี",
        registrantEmail: "test@example.com",
        activityTitle: "งานรวมรุ่นสถาปัตย์ประจำปี 2568",
        activityDate: "15 มกราคม 2568",
        activityLocation: "ห้องประชุมใหญ่ คณะสถาปัตยกรรมศาสตร์ จุฬาฯ",
        activitySlug: "activity-abc123-2568",
      }),
  },
  activityCancellation: {
    subject: "แจ้งยกเลิกกิจกรรม — งานรวมรุ่นสถาปัตย์ประจำปี 2568",
    html: () =>
      activityCancellationHtml({
        registrantName: "สมชาย ใจดี",
        registrantEmail: "test@example.com",
        activityTitle: "งานรวมรุ่นสถาปัตย์ประจำปี 2568",
        activityDate: "15 มกราคม 2568",
      }),
  },
} satisfies Record<string, { subject: string; html: () => Promise<string> }>;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ALLOWED.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const body = await req.json();
  const { template, to } = body as { template: string; to: string };

  if (!template || !(template in MOCK)) {
    return NextResponse.json({ error: "ไม่พบ template" }, { status: 400 });
  }
  if (!to?.trim()) {
    return NextResponse.json({ error: "กรุณากรอกอีเมลปลายทาง" }, { status: 400 });
  }

  const t = MOCK[template as keyof typeof MOCK];
  const result = await sendEmail({ to: to.trim(), subject: `[TEST] ${t.subject}`, html: await t.html() });

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "ส่งไม่สำเร็จ" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
