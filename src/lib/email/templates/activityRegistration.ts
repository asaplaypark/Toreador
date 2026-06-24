import { baseTemplate, heading, paragraph, infoBox, ctaButton } from "./base";
import { sendEmail } from "../resend";
import { getEmailSettings, type EmailSettings } from "@/lib/site-settings";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://toreadorclub.com";

type Props = {
  registrantName: string;
  registrantEmail: string;
  activityTitle: string;
  activityDate: string;
  activityLocation: string | null;
  activitySlug: string;
};

export async function activityRegistrationHtml(
  props: Props,
  emailSettings?: EmailSettings
): Promise<string> {
  const es = emailSettings ?? (await getEmailSettings());
  const infoRows = [
    { label: "กิจกรรม", value: props.activityTitle },
    { label: "วันที่", value: props.activityDate },
    ...(props.activityLocation ? [{ label: "สถานที่", value: props.activityLocation }] : []),
    { label: "ชื่อผู้ลงทะเบียน", value: props.registrantName },
  ];

  const content = [
    heading("ยืนยันการลงทะเบียนกิจกรรม"),
    paragraph(`${es.greeting} <strong>${props.registrantName}</strong>`),
    paragraph("การลงทะเบียนเข้าร่วมกิจกรรมของคุณสำเร็จแล้ว กรุณาเก็บอีเมลนี้ไว้เป็นหลักฐาน"),
    infoBox(infoRows),
    ctaButton("ดูรายละเอียดกิจกรรม", `${SITE_URL}/activities/${props.activitySlug}`),
    paragraph("หากต้องการยกเลิกการจอง กรุณาเข้าสู่ระบบและยกเลิกในหน้ากิจกรรม"),
  ].join("");

  return baseTemplate({
    title: `ยืนยันการลงทะเบียน — ${props.activityTitle}`,
    content,
    emailSettings: es,
  });
}

export async function sendActivityRegistrationEmail(props: Props) {
  return sendEmail({
    to: props.registrantEmail,
    subject: `ยืนยันการลงทะเบียน — ${props.activityTitle}`,
    html: await activityRegistrationHtml(props),
  });
}
