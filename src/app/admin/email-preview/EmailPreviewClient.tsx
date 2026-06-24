"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

const TEMPLATES = [
  { id: "memberRegistration", label: "สมัครสมาชิก (ยืนยันการรับสมัคร)" },
  { id: "memberApproved", label: "อนุมัติสมาชิก" },
  { id: "activityRegistration", label: "ลงทะเบียนกิจกรรม (ยืนยัน)" },
  { id: "activityCancellation", label: "ยกเลิกกิจกรรม" },
];

export default function EmailPreviewClient() {
  const [selected, setSelected] = useState(TEMPLATES[0].id);
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchHtml = useCallback(async (template: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/email-preview/html?template=${template}`);
      const d = await res.json() as { html?: string };
      setHtml(d.html ?? "");
    } catch {
      setHtml("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHtml(selected);
  }, [selected, fetchHtml]);

  function handleSelect(id: string) {
    setSelected(id);
    setMessage(null);
  }

  async function handleSend() {
    setMessage(null);
    if (!testEmail.trim()) {
      setMessage({ type: "error", text: "กรุณากรอกอีเมล" });
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/email-preview/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: selected, to: testEmail }),
      });
      const text = await res.text();
      let d: { ok?: boolean; error?: string } = {};
      try { d = JSON.parse(text); } catch { /* empty */ }
      if (res.ok) {
        setMessage({ type: "success", text: `ส่ง test email ไปที่ ${testEmail} แล้ว` });
      } else {
        setMessage({ type: "error", text: d.error ?? "เกิดข้อผิดพลาด" });
      }
    } catch {
      setMessage({ type: "error", text: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-charcoal">Template</label>
          <div className="flex gap-2 items-center">
            <select
              value={selected}
              onChange={(e) => handleSelect(e.target.value)}
              className="border border-sepia-pale rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sepia/30 min-w-[280px]"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => { setMessage(null); void fetchHtml(selected); }}
              disabled={loading}
              title="รีเฟรช"
              className="flex items-center gap-1.5 px-3 py-2 border border-sepia-pale rounded-md text-sm text-sepia hover:bg-sepia-cream transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              รีเฟรช
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-charcoal">ส่งทดสอบไปที่อีเมล</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="border border-sepia-pale rounded-md px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-sepia/30"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || loading}
              className="px-4 py-2 bg-sepia text-white rounded-md text-sm font-medium hover:bg-sepia-dark transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {sending ? "กำลังส่ง..." : "ส่ง Test Email"}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Preview */}
      <div className="border border-sepia-pale rounded-lg overflow-hidden">
        <div className="bg-sepia-cream/50 border-b border-sepia-pale px-4 py-2 text-xs text-charcoal/60 font-medium tracking-wide uppercase flex items-center justify-between">
          <span>Preview — {TEMPLATES.find((t) => t.id === selected)?.label}</span>
          {loading && <span className="text-sepia/60">กำลังโหลด...</span>}
        </div>
        {loading ? (
          <div className="flex items-center justify-center bg-white" style={{ height: "640px" }}>
            <RefreshCw className="size-6 text-sepia-pale animate-spin" />
          </div>
        ) : (
          <iframe
            srcDoc={html}
            title="Email Preview"
            className="w-full bg-white"
            style={{ height: "640px", border: "none" }}
            sandbox="allow-same-origin"
          />
        )}
      </div>

      <p className="text-xs text-charcoal/50">
        หลังแก้ไข Email Settings ใน{" "}
        <a href="/admin/settings" className="text-sepia underline underline-offset-2">
          การตั้งค่า → Email
        </a>{" "}
        กด <strong>รีเฟรช</strong> เพื่อดู preview ที่อัปเดต
      </p>
    </div>
  );
}
