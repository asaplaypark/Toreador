import { baseTemplate, heading, paragraph, infoBox, ctaButton } from "./base";
import { sendEmail } from "../resend";
import { getEmailSettings, type EmailSettings } from "@/lib/site-settings";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://toreadorclub.com";

type Props = {
  registrantName: string;
  registrantEmail: string;
  activityTitle: string;
  activityDate: string;
};

export async function activityCancellationHtml(
  props: Props,
  emailSettings?: EmailSettings
): Promise<string> {
  const es = emailSettings ?? (await getEmailSettings());
  const content = [
    heading("แจ้งยกเลิกกิจกรรม"),
    paragraph(`${es.greeting} <strong>${props.registrantName}</strong>`),
    paragraph(
      "ขออภัยเป็นอย่างยิ่ง เราขอแจ้งให้ทราบว่ากิจกรรมที่คุณได้ลงทะเบียนไว้ถูกยกเลิกแล้ว"
    ),
    infoBox([
      { label: "กิจกรรม", value: props.activityTitle },
      { label: "วันที่", value: props.activityDate },
      { label: "สถานะ", value: "ยกเลิก" },
    ]),
    paragraph(
      "เราขอโทษสำหรับความไม่สะดวกที่เกิดขึ้น และหวังว่าจะได้พบคุณในกิจกรรมครั้งต่อไป"
    ),
    ctaButton("ดูกิจกรรมอื่นๆ", `${SITE_URL}/activities`),
  ].join("");

  return baseTemplate({
    title: `แจ้งยกเลิกกิจกรรม — ${props.activityTitle}`,
    content,
    emailSettings: es,
  });
}

export async function sendActivityCancellationEmail(props: Props) {
  return sendEmail({
    to: props.registrantEmail,
    subject: `แจ้งยกเลิกกิจกรรม — ${props.activityTitle}`,
    html: await activityCancellationHtml(props),
  });
}
