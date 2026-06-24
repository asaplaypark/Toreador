import { baseTemplate, heading, paragraph, infoBox } from "./base";
import { sendEmail } from "../resend";
import { getEmailSettings, type EmailSettings } from "@/lib/site-settings";

type Props = {
  name: string;
  email: string;
  department: string;
};

export async function memberRegistrationHtml(
  props: Props,
  emailSettings?: EmailSettings
): Promise<string> {
  const es = emailSettings ?? (await getEmailSettings());
  const content = [
    heading("ขอบคุณสำหรับการสมัครสมาชิก"),
    paragraph(`${es.greeting} <strong>${props.name}</strong>`),
    paragraph(
      "เราได้รับใบสมัครสมาชิกของคุณแล้ว ขอขอบคุณที่ให้ความสนใจในการเข้าร่วมสมาคมนิสิตเก่าคณะสถาปัตยกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย"
    ),
    infoBox([
      { label: "ชื่อ", value: props.name },
      { label: "อีเมล", value: props.email },
      { label: "ภาควิชา", value: props.department },
    ]),
    paragraph(
      "ใบสมัครของคุณกำลังรอการอนุมัติจากผู้ดูแลระบบ เราจะส่งอีเมลแจ้งให้ทราบเมื่อการสมัครของคุณได้รับการอนุมัติ"
    ),
  ].join("");

  return baseTemplate({
    title: "ขอบคุณสำหรับการสมัครสมาชิก",
    content,
    emailSettings: es,
  });
}

export async function sendMemberRegistrationEmail(props: Props) {
  return sendEmail({
    to: props.email,
    subject: "ขอบคุณสำหรับการสมัครสมาชิก — สมาคมนิสิตเก่าสถาปัตย์ จุฬาฯ",
    html: await memberRegistrationHtml(props),
  });
}
