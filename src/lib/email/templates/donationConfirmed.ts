import { baseTemplate, heading, paragraph, infoBox, ctaButton } from "./base";
import { sendEmail } from "../resend";
import { getEmailSettings, type EmailSettings } from "@/lib/site-settings";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://toreadorclub.com";

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

export async function donationConfirmedHtml(
  props: Props,
  emailSettings?: EmailSettings
): Promise<string> {
  const es = emailSettings ?? (await getEmailSettings());
  const fundLabel = FUND_LABELS[props.fund] ?? props.fund;
  const content = [
    heading("ยืนยันการบริจาคสำเร็จ"),
    paragraph(`${es.greeting} <strong>${props.donorName}</strong>`),
    paragraph(
      "สมาคมฯ ได้รับการบริจาคของคุณเรียบร้อยแล้ว ขอขอบคุณอย่างสูงที่ให้การสนับสนุนกองทุนของสมาคมนิสิตเก่าคณะสถาปัตยกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย"
    ),
    infoBox([
      { label: "กองทุน", value: fundLabel },
      { label: "จำนวนเงิน", value: `${props.amount.toLocaleString("th-TH")} บาท` },
      { label: "สถานะ", value: "ยืนยันแล้ว ✓" },
    ]),
    paragraph("น้ำใจของคุณจะเป็นประโยชน์แก่คณาจารย์ นิสิต และสมาชิกของสมาคมต่อไป"),
    ctaButton("ดูกิจกรรมของสมาคม", `${SITE_URL}/activities`),
  ].join("");

  return baseTemplate({
    title: `ยืนยันการบริจาค — ${fundLabel}`,
    content,
    emailSettings: es,
  });
}

export async function sendDonationConfirmedEmail(props: Props) {
  return sendEmail({
    to: props.email,
    subject: `ยืนยันการบริจาค — ${FUND_LABELS[props.fund] ?? props.fund}`,
    html: await donationConfirmedHtml(props),
  });
}
