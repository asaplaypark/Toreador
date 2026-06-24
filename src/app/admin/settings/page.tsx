import { prisma } from "@/lib/prisma";
import { ensureEmailSettings } from "@/lib/site-settings";
import SettingsForm, { type Setting } from "./SettingsForm";

export default async function AdminSettingsPage() {
  await ensureEmailSettings();
  const rows = await prisma.siteSettings.findMany({ orderBy: { group: "asc" } });

  const settings: Setting[] = rows.map((r) => ({
    key: r.key,
    value: r.value,
    label: r.label,
    type: r.type,
    group: r.group,
  }));

  return (
    <div className="flex-1 bg-sepia-bg px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">การตั้งค่าเว็บไซต์</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            จัดการเนื้อหาและรูปลักษณ์ของเว็บไซต์
          </p>
        </div>
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
