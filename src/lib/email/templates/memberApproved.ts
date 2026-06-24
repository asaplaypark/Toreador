import { baseTemplate, heading, paragraph, ctaButton } from "./base";
import { sendEmail } from "../resend";
import { getEmailSettings, type EmailSettings } from "@/lib/site-settings";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://toreadorclub.com";

type Props = {
  name: string;
  email: string;
};

export async function memberApprovedHtml(
  props: Props,
  emailSettings?: EmailSettings
): Promise<string> {
  const es = emailSettings ?? (await getEmailSettings());
  const content = [
    heading("ยินดีต้อนรับสู่สมาคม!"),
    paragraph(`${es.greeting} <strong>${props.name}</strong>`),
    paragraph(
      "ยินดีด้วย! การสมัครสมาชิกสมาคมนิสิตเก่าคณะสถาปัตยกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย ของคุณได้รับการอนุมัติแล้ว"
    ),
    paragraph("คุณสามารถเข้าใช้งานระบบได้ทันที ด้วยฟีเจอร์ต่างๆ ดังนี้"),
    `<ul style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#333;line-height:2;">
      <li>ดูทำเนียบสมาชิกนิสิตเก่าทุกรุ่น</li>
      <li>ติดตามข่าวสารและกิจกรรมของสมาคม</li>
      <li>ลงทะเบียนเข้าร่วมกิจกรรม</li>
      <li>แก้ไขโปรไฟล์และข้อมูลส่วนตัว</li>
    </ul>`,
    ctaButton("เข้าสู่ระบบ", `${SITE_URL}/login`),
  ].join("");

  return baseTemplate({
    title: "การสมัครสมาชิกได้รับการอนุมัติแล้ว",
    content,
    emailSettings: es,
  });
}

export async function sendMemberApprovedEmail(props: Props) {
  return sendEmail({
    to: props.email,
    subject: "ยินดีต้อนรับ! การสมัครสมาชิกของคุณได้รับการอนุมัติแล้ว",
    html: await memberApprovedHtml(props),
  });
}
