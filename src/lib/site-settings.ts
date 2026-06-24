import { cache } from "react";
import { prisma } from "./prisma";

/** Fetches all SiteSettings as a key→value map. Deduplicated per request via React cache(). */
export const getSiteSettings = cache(async (): Promise<Record<string, string>> => {
  const rows = await prisma.siteSettings.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

/** Get a single setting with a fallback. */
export async function getSetting(key: string, fallback = ""): Promise<string> {
  const settings = await getSiteSettings();
  return settings[key] ?? fallback;
}

// ─── Email settings ───────────────────────────────────────────────────────────

export type EmailSettings = {
  greeting: string;
  signature: string;
  footerNote: string;
  contact: string;
};

const EMAIL_SETTING_DEFAULTS = [
  {
    key: "email_greeting",
    label: "คำทักทาย",
    type: "text",
    group: "email",
    value: "เรียน",
  },
  {
    key: "email_signature",
    label: "ลายเซ็น",
    type: "textarea",
    group: "email",
    value:
      "ด้วยความนับถือ\nสมาคมนิสิตเก่า คณะสถาปัตยกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
  },
  {
    key: "email_footer_note",
    label: "หมายเหตุท้าย Email",
    type: "textarea",
    group: "email",
    value: "หากมีข้อสงสัย กรุณาติดต่อสมาคมฯ ที่ toreadorclub.com",
  },
  {
    key: "email_contact",
    label: "ข้อมูลติดต่อใน Email",
    type: "text",
    group: "email",
    value: "",
  },
];

/** Upsert email settings with defaults — safe to call on every page load (noop if already exist). */
export async function ensureEmailSettings(): Promise<void> {
  await Promise.all(
    EMAIL_SETTING_DEFAULTS.map((s) =>
      prisma.siteSettings.upsert({
        where: { key: s.key },
        create: s,
        update: {},
      })
    )
  );
}

/** Fetch email-group settings from DB (not cached — always fresh). */
export async function getEmailSettings(): Promise<EmailSettings> {
  const rows = await prisma.siteSettings.findMany({ where: { group: "email" } });
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    greeting: s["email_greeting"] || "เรียน",
    signature:
      s["email_signature"] ||
      "ด้วยความนับถือ\nสมาคมนิสิตเก่า คณะสถาปัตยกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    footerNote:
      s["email_footer_note"] || "หากมีข้อสงสัย กรุณาติดต่อสมาคมฯ ที่ toreadorclub.com",
    contact: s["email_contact"] ?? "",
  };
}
