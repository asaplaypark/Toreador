import { Resend } from "resend";

const FROM = "สมาคมนิสิตเก่าสถาปัตย์ จุฬาฯ <noreply@toreadorclub.com>";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — email sending disabled");
    return null;
  }
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getClient();
  if (!resend) return { success: false, error: "Email sending disabled" };

  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error("[email] Resend error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[email] Send failed:", msg);
    return { success: false, error: msg };
  }
}
