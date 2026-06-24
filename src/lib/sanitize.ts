import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["br", "strong", "em", "span"],
    ALLOWED_ATTR: ["class", "style"],
  });
}
