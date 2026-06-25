import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { memberRegistrationHtml } from "@/lib/email/templates/memberRegistration";
import { memberApprovedHtml } from "@/lib/email/templates/memberApproved";
import { activityRegistrationHtml } from "@/lib/email/templates/activityRegistration";
import { activityCancellationHtml } from "@/lib/email/templates/activityCancellation";
import { donationReceivedHtml } from "@/lib/email/templates/donationReceived";
import { donationConfirmedHtml } from "@/lib/email/templates/donationConfirmed";
import { getEmailSettings } from "@/lib/site-settings";

const ALLOWED = ["ADMIN", "SUPER_ADMIN"];

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ALLOWED.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const template = searchParams.get("template") ?? "memberRegistration";

  const es = await getEmailSettings();

  let html = "";
  switch (template) {
    case "memberRegistration":
      html = await memberRegistrationHtml(
        { name: "สมชาย ใจดี", email: "test@example.com", department: "สถาปัตยกรรม" },
        es
      );
      break;
    case "memberApproved":
      html = await memberApprovedHtml({ name: "สมชาย ใจดี", email: "test@example.com" }, es);
      break;
    case "activityRegistration":
      html = await activityRegistrationHtml(
        {
          registrantName: "สมชาย ใจดี",
          registrantEmail: "test@example.com",
          activityTitle: "งานรวมรุ่นสถาปัตย์ประจำปี 2568",
          activityDate: "15 มกราคม 2568",
          activityLocation: "ห้องประชุมใหญ่ คณะสถาปัตยกรรมศาสตร์ จุฬาฯ",
          activitySlug: "activity-abc123-2568",
        },
        es
      );
      break;
    case "activityCancellation":
      html = await activityCancellationHtml(
        {
          registrantName: "สมชาย ใจดี",
          registrantEmail: "test@example.com",
          activityTitle: "งานรวมรุ่นสถาปัตย์ประจำปี 2568",
          activityDate: "15 มกราคม 2568",
        },
        es
      );
      break;
    case "donationReceived":
      html = await donationReceivedHtml(
        { donorName: "สมชาย ใจดี", email: "test@example.com", fund: "KATANYU", amount: 1000 },
        es
      );
      break;
    case "donationConfirmed":
      html = await donationConfirmedHtml(
        { donorName: "สมชาย ใจดี", email: "test@example.com", fund: "STACARE", amount: 500 },
        es
      );
      break;
    default:
      return NextResponse.json({ error: "ไม่พบ template" }, { status: 400 });
  }

  return NextResponse.json({ html });
}
