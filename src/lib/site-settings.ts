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
