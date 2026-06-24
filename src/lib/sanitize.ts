const ALLOWED_TAGS = /^(br|strong|em|span)$/i;

export function sanitizeHtml(html: string): string {
  return html
    // Strip script blocks entirely (content + tag)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Strip any tag that isn't in the allowlist
    .replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag) =>
      ALLOWED_TAGS.test(tag) ? match : ""
    )
    // Strip event handlers and javascript: hrefs from surviving tags
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/javascript\s*:/gi, "");
}
