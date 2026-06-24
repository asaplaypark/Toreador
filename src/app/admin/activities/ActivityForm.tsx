"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import NewsCoverUpload from "@/components/NewsCoverUpload";
import RichTextEditor from "@/components/RichTextEditor";

export type ActivityFormValues = {
  title: string;
  description: string;
  coverImage: string;
  location: string;
  onlineLink: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  registrationDeadline: string;
  registrationDeadlineTime: string;
  maxSeats: string;
  requireRegistration: boolean;
  allowGuestView: boolean;
  visibility: string;
  status: string;
};

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "สาธารณะ" },
  { value: "MEMBERS_ONLY", label: "สมาชิกเท่านั้น" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "ฉบับร่าง" },
  { value: "PUBLISHED", label: "เผยแพร่" },
  { value: "CANCELLED", label: "ยกเลิก" },
  { value: "COMPLETED", label: "เสร็จสิ้น" },
];

function combineDatetime(date: string, time: string): string | null {
  if (!date) return null;
  return `${date}T${time || "00:00"}:00`;
}

export default function ActivityForm({
  initialValues,
  activityId,
}: {
  initialValues?: Partial<ActivityFormValues>;
  activityId?: string;
}) {
  const router = useRouter();
  const isEdit = !!activityId;

  const [form, setForm] = useState<ActivityFormValues>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    coverImage: initialValues?.coverImage ?? "",
    location: initialValues?.location ?? "",
    onlineLink: initialValues?.onlineLink ?? "",
    startDate: initialValues?.startDate ?? "",
    startTime: initialValues?.startTime ?? "09:00",
    endDate: initialValues?.endDate ?? "",
    endTime: initialValues?.endTime ?? "",
    registrationDeadline: initialValues?.registrationDeadline ?? "",
    registrationDeadlineTime: initialValues?.registrationDeadlineTime ?? "23:59",
    maxSeats: initialValues?.maxSeats ?? "",
    requireRegistration: initialValues?.requireRegistration ?? true,
    allowGuestView: initialValues?.allowGuestView ?? true,
    visibility: initialValues?.visibility ?? "PUBLIC",
    status: initialValues?.status ?? "DRAFT",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof ActivityFormValues>(key: K, value: ActivityFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) { setError("กรุณากรอกชื่อกิจกรรม"); return; }
    if (!form.startDate) { setError("กรุณาเลือกวันที่เริ่ม"); return; }

    const payload = {
      title: form.title,
      description: form.description,
      coverImage: form.coverImage || null,
      location: form.location || null,
      onlineLink: form.onlineLink || null,
      startDate: combineDatetime(form.startDate, form.startTime),
      endDate: combineDatetime(form.endDate, form.endTime),
      registrationDeadline: combineDatetime(form.registrationDeadline, form.registrationDeadlineTime),
      maxSeats: form.maxSeats ? Number(form.maxSeats) : null,
      requireRegistration: form.requireRegistration,
      allowGuestView: form.allowGuestView,
      visibility: form.visibility,
      status: form.status,
    };

    setLoading(true);
    const res = isEdit
      ? await fetch(`/api/admin/activities/${activityId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "เกิดข้อผิดพลาด"); return; }
    router.push("/admin/activities");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* เนื้อหา */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
            เนื้อหา
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">ชื่อกิจกรรม *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="ชื่อกิจกรรม"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>รายละเอียด</Label>
            <RichTextEditor
              value={form.description}
              onChange={(html) => set("description", html)}
              placeholder="รายละเอียดกิจกรรม..."
            />
          </div>
          <NewsCoverUpload
            value={form.coverImage}
            onChange={(url) => set("coverImage", url)}
          />
        </CardContent>
      </Card>

      {/* วันและสถานที่ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
            วัน เวลา และสถานที่
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">วันที่เริ่ม *</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">เวลาเริ่ม</Label>
              <Input
                id="startTime"
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">วันที่สิ้นสุด</Label>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">เวลาสิ้นสุด</Label>
              <Input
                id="endTime"
                type="time"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">สถานที่</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="เช่น ห้องประชุม A, อาคาร..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="onlineLink">ลิงก์ออนไลน์</Label>
            <Input
              id="onlineLink"
              type="url"
              value={form.onlineLink}
              onChange={(e) => set("onlineLink", e.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </div>
        </CardContent>
      </Card>

      {/* การจอง */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
            การจองที่นั่ง
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={form.requireRegistration}
                onCheckedChange={(v) => set("requireRegistration", Boolean(v))}
              />
              <span className="text-sm font-medium">ต้องจองที่นั่ง</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={form.allowGuestView}
                onCheckedChange={(v) => set("allowGuestView", Boolean(v))}
              />
              <span className="text-sm font-medium">ให้แขกดูได้ (ไม่ต้อง login)</span>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxSeats">จำนวนที่นั่งสูงสุด</Label>
              <Input
                id="maxSeats"
                type="number"
                min="1"
                value={form.maxSeats}
                onChange={(e) => set("maxSeats", e.target.value)}
                placeholder="ว่างไว้ = ไม่จำกัด"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regDeadline">วันปิดรับจอง</Label>
              <Input
                id="regDeadline"
                type="date"
                value={form.registrationDeadline}
                onChange={(e) => set("registrationDeadline", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* การเผยแพร่ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
            การเผยแพร่
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>การมองเห็น</Label>
            <Select value={form.visibility} onValueChange={(v) => set("visibility", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>สถานะ</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading
            ? isEdit ? "กำลังบันทึก..." : "กำลังสร้าง..."
            : isEdit ? "บันทึกการแก้ไข" : "สร้างกิจกรรม"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/activities")}>
          ยกเลิก
        </Button>
      </div>
    </form>
  );
}
