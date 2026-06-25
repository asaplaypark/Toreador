import { baseTemplate, heading, paragraph, infoBox } from "./base";
import { sendEmail } from "../resend";
import { getEmailSettings, type EmailSettings } from "@/lib/site-settings";

const FUND_LABELS: Record<string, string> = {
  KATANYU: "กองทุนกตัญญูครูสถา",
  STACARE: "กองทุนสถาอาทร",
};

type Props = {
  donorName: string;
  email: string;
  fund: string;
  amount: number;
};

export async function donationReceivedHtml(
  props: Props,
  emailSettings?: EmailSettings
): Promise<string> {
  const es = emailSettings ?? (await getEmailSettings());
  const fundLabel = FUND_LABELS[props.fund] ?? props.fund;
  const content = [
    heading("ขอบคุณสำหรับการบริจาค"),
    paragraph(`${es.greeting} <strong>${props.donorName}</strong>`),
    paragraph(
      "เราได้รับข้อมูลการบริจาคของคุณแล้ว และกำลังตรวจสอบหลักฐานการโอนเงิน เราจะแจ้งผลยืนยันให้ทราบทางอีเมลนี้"
    ),
    infoBox([
      { label: "กองทุน", value: fundLabel },
      { label: "จำนวนเงิน", value: `${props.amount.toLocaleString("th-TH")} บาท` },
      { label: "สถานะ", value: "รอการตรวจสอบ" },
    ]),
    paragraph("หากมีข้อสงสัย กรุณาติดต่อสมาคมฯ ผ่านช่องทางที่ระบุไว้ในเว็บไซต์"),
  ].join("");

  return baseTemplate({
    title: `ขอบคุณสำหรับการบริจาค — ${fundLabel}`,
    content,
    emailSettings: es,
  });
}

export async function sendDonationReceivedEmail(props: Props) {
  return sendEmail({
    to: props.email,
    subject: `ขอบคุณสำหรับการบริจาค — ${FUND_LABELS[props.fund] ?? props.fund}`,
    html: await donationReceivedHtml(props),
  });
}
