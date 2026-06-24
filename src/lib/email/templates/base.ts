import { getEmailSettings, type EmailSettings } from "@/lib/site-settings";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://toreadorclub.com";
const SEPIA_DARK = "#3D1F00";
const SEPIA = "#6B3A0F";
const SEPIA_CREAM = "#F5EFE6";
const SEPIA_PALE = "#D9C9B3";

function signatureHtml(signature: string): string {
  const lines = signature.split("\n").filter(Boolean);
  const rendered = lines
    .map((line, i) =>
      i === 0
        ? `<p style="margin:0;font-size:14px;color:#555;line-height:1.8;font-style:italic;">${line}</p>`
        : `<p style="margin:0;font-size:13px;color:#777;line-height:1.8;">${line}</p>`
    )
    .join("");
  return `<div style="margin:28px 0 0;padding-top:20px;border-top:1px solid ${SEPIA_CREAM};">${rendered}</div>`;
}

export async function baseTemplate({
  title,
  content,
  emailSettings,
}: {
  title: string;
  content: string;
  emailSettings?: EmailSettings;
}): Promise<string> {
  const es = emailSettings ?? (await getEmailSettings());

  const footerLines = [
    es.footerNote,
    ...(es.contact ? [es.contact] : []),
    `<a href="${SITE_URL}" style="color:${SEPIA};text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>`,
  ];

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f0eb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f0eb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:${SEPIA_DARK};padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:26px;font-weight:700;letter-spacing:0.16em;color:#ffffff;">
                TOREADOR CLUB
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:${SEPIA_PALE};letter-spacing:0.04em;">
                สมาคมนิสิตเก่า คณะสถาปัตยกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 32px;">
              ${content}
              ${signatureHtml(es.signature)}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid ${SEPIA_CREAM};margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999;line-height:1.9;">
                ${footerLines.join("<br />")}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Reusable block helpers */
export function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:${SEPIA_DARK};line-height:1.4;">${text}</h1>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;color:#333;line-height:1.8;">${text}</p>`;
}

export function infoBox(rows: { label: string; value: string }[]): string {
  const rowsHtml = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:8px 12px;font-size:13px;color:#666;white-space:nowrap;vertical-align:top;">${r.label}</td>
        <td style="padding:8px 12px;font-size:13px;color:#333;font-weight:500;">${r.value}</td>
      </tr>`
    )
    .join("");
  return `<table cellpadding="0" cellspacing="0" style="background:${SEPIA_CREAM};border-radius:6px;width:100%;margin:16px 0;">${rowsHtml}</table>`;
}

export function ctaButton(text: string, href: string): string {
  return `
  <div style="margin:24px 0;">
    <a href="${href}" style="display:inline-block;background-color:${SEPIA};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:15px;font-weight:500;">
      ${text}
    </a>
  </div>`;
}
