"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, MapPin } from "lucide-react";

type Prefill = { name: string; email: string; phone: string; lineId: string };

type ActivitySummary = {
  id: string;
  title: string;
  startDateFormatted: string;
  location: string | null;
};

export default function RegisterButton({
  activity,
  prefill,
  isRegistered,
  isFull,
  isClosed,
}: {
  activity: ActivitySummary;
  prefill: Prefill; // empty strings for guests
  isRegistered: boolean; // always false for guests
  isFull: boolean;
  isClosed: boolean;
}) {
  const [registered, setRegistered] = useState(isRegistered);
  const [full, setFull] = useState(isFull);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: prefill.name,
    email: prefill.email,
    phone: prefill.phone,
    lineId: prefill.lineId,
    note: "",
  });

  function set(key: keyof typeof form, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) { setError("กรุณากรอกชื่อ-นามสกุล"); return; }
    if (!form.email.trim()) { setError("กรุณากรอกอีเมล"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("รูปแบบอีเมลไม่ถูกต้อง"); return;
    }
    if (!form.phone.trim()) { setError("กรุณากรอกเบอร์โทรศัพท์"); return; }

    setLoading(true);
    const res = await fetch(`/api/activities/${activity.id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registrantName: form.name,
        registrantEmail: form.email,
        registrantPhone: form.phone,
        registrantLineId: form.lineId || null,
        note: form.note || null,
      }),
    });
    setLoading(false);

    if (res.ok) {
      setRegistered(true);
      setOpen(false);
    } else {
      const text = await res.text();
      let d: { error?: string } = {};
      try {
        d = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text.slice(0, 300));
        setError("เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง");
        return;
      }
      setError(d.error ?? "เกิดข้อผิดพลาด");
    }
  }

  async function handleCancel() {
    if (!confirm("ยืนยันยกเลิกการจอง?")) return;
    setLoading(true);
    await fetch(`/api/activities/${activity.id}/register`, { method: "DELETE" });
    setLoading(false);
    setRegistered(false);
    setFull(false);
  }

  if (isClosed) {
    return <p className="text-sm font-medium text-muted-foreground">ปิดรับจองแล้ว</p>;
  }

  if (registered) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <p className="rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          ✓ คุณได้ลงทะเบียนแล้ว
        </p>
        {/* Only logged-in members can cancel via API */}
        {prefill.email && (
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
            ยกเลิกการจอง
          </Button>
        )}
      </div>
    );
  }

  if (full) {
    return (
      <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
        ที่นั่งเต็มแล้ว
      </p>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>ลงทะเบียน</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>ลงทะเบียนเข้าร่วมกิจกรรม</DialogTitle>
            <DialogDescription asChild>
              <div className="mt-2 space-y-1 rounded-md bg-sepia-cream/60 px-3 py-2 text-sm text-charcoal">
                <p className="font-medium">{activity.title}</p>
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="size-3.5 shrink-0" />
                  {activity.startDateFormatted}
                </p>
                {activity.location && (
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    {activity.location}
                  </p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          {/* noValidate disables browser-native HTML5 constraint validation
              (type="email" / type="tel" throw "string did not match expected pattern"
               before React's onSubmit can call preventDefault) */}
          <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reg-name">ชื่อ-นามสกุล *</Label>
              <Input
                id="reg-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="ชื่อ นามสกุล"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">อีเมล *</Label>
              <Input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-phone">เบอร์โทรศัพท์ *</Label>
              <Input
                id="reg-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="08X-XXX-XXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-line">LINE ID</Label>
              <Input
                id="reg-line"
                value={form.lineId}
                onChange={(e) => set("lineId", e.target.value)}
                placeholder="LINE ID (ถ้ามี)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-note">หมายเหตุ</Label>
              <Textarea
                id="reg-note"
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
                placeholder="ข้อมูลเพิ่มเติม เช่น ข้อจำกัดอาหาร, ความต้องการพิเศษ"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "กำลังลงทะเบียน..." : "ยืนยันการลงทะเบียน"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                ยกเลิก
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
