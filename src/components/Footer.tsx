import { getSiteSettings } from "@/lib/site-settings";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

export default async function Footer() {
  const s = await getSiteSettings();
  const year = new Date().getFullYear();

  const siteName = s.site_name || "TOREADOR";
  const tagline = s.site_tagline || "";
  const address = s.footer_address || "";
  const email = s.footer_email || "";
  const phone = s.footer_phone || "";
  const facebook = s.footer_facebook || "";
  const lineId = s.footer_line_id || "";

  const hasContact = address || email || phone || facebook || lineId;

  return (
    <footer style={{ backgroundColor: "var(--sepia-dark)" }} className="text-sepia-cream">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.jpg"
                alt={siteName}
                width={36}
                height={36}
                className="rounded-full object-cover"
                style={{ width: "auto", height: "36px" }}
              />
              <span className="text-lg font-medium tracking-widest text-white">
                {siteName}
              </span>
            </div>
            {tagline && (
              <p className="text-sm leading-relaxed text-sepia-pale">{tagline}</p>
            )}
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-widest text-sepia-light">
              ลิงก์ด่วน
            </h3>
            <ul className="space-y-2 text-sm text-sepia-pale">
              <li><Link href="/news" className="transition-colors hover:text-white">ข่าวสาร</Link></li>
              <li><Link href="/members" className="transition-colors hover:text-white">ทำเนียบสมาชิก</Link></li>
              <li><Link href="/register" className="transition-colors hover:text-white">สมัครสมาชิก</Link></li>
              <li><Link href="/login" className="transition-colors hover:text-white">เข้าสู่ระบบ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          {hasContact && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium uppercase tracking-widest text-sepia-light">
                ติดต่อ
              </h3>
              <ul className="space-y-2 text-sm text-sepia-pale">
                {address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-sepia-light" />
                    <span className="whitespace-pre-line">{address}</span>
                  </li>
                )}
                {email && (
                  <li className="flex items-center gap-2">
                    <Mail className="size-4 shrink-0 text-sepia-light" />
                    <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                      {email}
                    </a>
                  </li>
                )}
                {phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="size-4 shrink-0 text-sepia-light" />
                    <a href={`tel:${phone}`} className="hover:text-white transition-colors">
                      {phone}
                    </a>
                  </li>
                )}
                {facebook && (
                  <li className="flex items-center gap-2">
                    <span className="size-4 shrink-0 text-center text-xs font-bold text-sepia-light leading-4">
                      f
                    </span>
                    <a
                      href={facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      Facebook
                    </a>
                  </li>
                )}
                {lineId && (
                  <li className="flex items-center gap-2">
                    <span className="size-4 shrink-0 text-center text-xs font-bold text-sepia-light leading-4">
                      LINE
                    </span>
                    <span>{lineId}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div
          className="mt-8 border-t pt-6 text-center text-xs text-sepia-light"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          © {year} {siteName}. สงวนลิขสิทธิ์.
        </div>
      </div>
    </footer>
  );
}
