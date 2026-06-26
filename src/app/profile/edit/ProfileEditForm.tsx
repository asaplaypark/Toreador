"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AvatarUpload from "@/components/AvatarUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "สาธารณะ" },
  { value: "MEMBERS_ONLY", label: "สมาชิกเท่านั้น" },
  { value: "ADMIN_ONLY", label: "แอดมินเท่านั้น" },
];

const VISIBILITY_FIELDS: { key: string; label: string }[] = [
  { key: "phone", label: "โทรศัพท์" },
  { key: "occupation", label: "อาชีพ" },
  { key: "workplace", label: "ที่ทำงาน" },
  { key: "lineId", label: "LINE ID" },
  { key: "website", label: "เว็บไซต์" },
  { key: "bio", label: "ประวัติย่อ" },
  { key: "birthDate", label: "วันเกิด" },
];

type Props = {
  memberId: string;
  initialData: {
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn: string;
    lastNameEn: string;
    nickname: string;
    formerFirstName: string;
    formerLastName: string;
    phone: string;
    occupation: string;
    workplace: string;
    lineId: string;
    website: string;
    bio: string;
    profilePhoto: string | null;
    fieldVisibility: Record<string, string>;
  };
  readOnlyInfo: {
    department: string;
    yearOfEntry: string;
    birthDate: string;
  };
};

export default function ProfileEditForm({ memberId, initialData, readOnlyInfo }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
    setError("");
  }

  function setVisibility(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      fieldVisibility: { ...prev.fieldVisibility, [field]: value },
    }));
    setSuccess(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstNameTh.trim()) { setError("กรุณากรอกชื่อ (ภาษาไทย)"); return; }
    if (!form.lastNameTh.trim()) { setError("กรุณากรอกนามสกุล (ภาษาไทย)"); return; }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstNameTh: form.firstNameTh,
          lastNameTh: form.lastNameTh,
          firstNameEn: form.firstNameEn,
          lastNameEn: form.lastNameEn,
          nickname: form.nickname,
          formerFirstName: form.formerFirstName,
          formerLastName: form.formerLastName,
          phone: form.phone,
          occupation: form.occupation,
          workplace: form.workplace,
          lineId: form.lineId,
          website: form.website,
          bio: form.bio,
          fieldVisibility: form.fieldVisibility,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด");
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Avatar */}
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <AvatarUpload
            initialUrl={form.profilePhoto}
            initials={form.firstNameTh}
          />
        </CardContent>
      </Card>

      {/* Name */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium text-sepia-mid uppercase tracking-widest">
            ชื่อ - นามสกุล
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstNameTh">ชื่อ (ภาษาไทย) *</Label>
            <Input
              id="firstNameTh"
              value={form.firstNameTh}
              onChange={(e) => set("firstNameTh", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastNameTh">นามสกุล (ภาษาไทย) *</Label>
            <Input
              id="lastNameTh"
              value={form.lastNameTh}
              onChange={(e) => set("lastNameTh", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="firstNameEn">ชื่อ (ภาษาอังกฤษ)</Label>
            <Input
              id="firstNameEn"
              value={form.firstNameEn}
              onChange={(e) => set("firstNameEn", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastNameEn">นามสกุล (ภาษาอังกฤษ)</Label>
            <Input
              id="lastNameEn"
              value={form.lastNameEn}
              onChange={(e) => set("lastNameEn", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nickname">ชื่อเล่น</Label>
            <Input
              id="nickname"
              value={form.nickname}
              onChange={(e) => set("nickname", e.target.value)}
              placeholder="ไม่บังคับ"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="formerFirstName">ชื่อเดิม (สมัยเรียน)</Label>
            <Input
              id="formerFirstName"
              value={form.formerFirstName}
              onChange={(e) => set("formerFirstName", e.target.value)}
              placeholder="ชื่อสมัยเรียน (ถ้าเปลี่ยนแล้ว)"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="formerLastName">นามสกุลเดิม (สมัยเรียน)</Label>
            <Input
              id="formerLastName"
              value={form.formerLastName}
              onChange={(e) => set("formerLastName", e.target.value)}
              placeholder="นามสกุลสมัยเรียน (ถ้าเปลี่ยนแล้ว)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Read-only academic info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium text-sepia-mid uppercase tracking-widest">
            ข้อมูลทางการศึกษา
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">สาขา</Label>
            <Input value={readOnlyInfo.department} disabled className="bg-sepia-cream/50" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">ปีที่เข้าศึกษา</Label>
            <Input value={readOnlyInfo.yearOfEntry} disabled className="bg-sepia-cream/50" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">วันเกิด</Label>
            <Input value={readOnlyInfo.birthDate} disabled className="bg-sepia-cream/50" />
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2 self-end pb-0.5">
            หากต้องการแก้ไขข้อมูลเหล่านี้ กรุณาติดต่อแอดมิน
          </p>
        </CardContent>
      </Card>

      {/* Contact & work info with visibility */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium text-sepia-mid uppercase tracking-widest">
            ข้อมูลส่วนตัวและการตั้งค่าการมองเห็น
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            { key: "phone", label: "โทรศัพท์", type: "tel", placeholder: "08x-xxx-xxxx" },
            { key: "occupation", label: "อาชีพ", type: "text", placeholder: "" },
            { key: "workplace", label: "ที่ทำงาน", type: "text", placeholder: "" },
            { key: "lineId", label: "LINE ID", type: "text", placeholder: "" },
            { key: "website", label: "เว็บไซต์", type: "url", placeholder: "https://" },
          ].map(({ key, label, type, placeholder }) => (
            <FieldWithVisibility
              key={key}
              fieldKey={key}
              label={label}
              visibility={form.fieldVisibility[key] ?? "MEMBERS_ONLY"}
              onVisibilityChange={(v) => setVisibility(key, v)}
            >
              <Input
                type={type}
                value={(form as unknown as Record<string, string>)[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
              />
            </FieldWithVisibility>
          ))}

          {/* Bio */}
          <FieldWithVisibility
            fieldKey="bio"
            label="ประวัติย่อ"
            visibility={form.fieldVisibility.bio ?? "MEMBERS_ONLY"}
            onVisibilityChange={(v) => setVisibility("bio", v)}
          >
            <Textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              rows={4}
              placeholder="แนะนำตัวเองสั้นๆ..."
            />
          </FieldWithVisibility>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          บันทึกข้อมูลเรียบร้อยแล้ว
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </Button>
      </div>
    </form>
  );
}

function FieldWithVisibility({
  fieldKey,
  label,
  visibility,
  onVisibilityChange,
  children,
}: {
  fieldKey: string;
  label: string;
  visibility: string;
  onVisibilityChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={fieldKey}>{label}</Label>
        <Select value={visibility} onValueChange={onVisibilityChange}>
          <SelectTrigger className="h-7 w-[160px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VISIBILITY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {children}
    </div>
  );
}
