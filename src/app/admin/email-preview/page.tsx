import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ensureEmailSettings } from "@/lib/site-settings";
import EmailPreviewClient from "./EmailPreviewClient";

const ALLOWED = ["ADMIN", "SUPER_ADMIN"];

export default async function EmailPreviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ALLOWED.includes(session.user.role ?? "")) {
    redirect("/admin");
  }

  await ensureEmailSettings();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-charcoal">ตัวอย่าง Email Templates</h1>
        <p className="text-sm text-charcoal/60 mt-1">ดูตัวอย่างและทดสอบส่ง email notifications</p>
      </div>
      <EmailPreviewClient />
    </div>
  );
}
