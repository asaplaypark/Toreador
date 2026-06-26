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
import { DEPARTMENT_OPTIONS } from "@/lib/departments";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "รอการอนุมัติ" },
  { value: "ACTIVE", label: "สมาชิก" },
  { value: "INACTIVE", label: "ระงับชั่วคราว" },
  { value: "REJECTED", label: "ปฏิเสธ" },
];

const ROLE_OPTIONS = [
  { value: "MEMBER", label: "สมาชิก" },
  { value: "EDITOR", label: "บรรณาธิการ" },
  { value: "HEAD_OF_STUDIO", label: "หัวหน้าสตูดิโอ" },
  { value: "ADMIN", label: "ผู้ดูแลระบบ" },
];

type FormState = {
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  nickname: string;
  formerFirstName: string;
  formerLastName: string;
  birthDate: string;
  department: string;
  yearOfEntry: string;
  phone: string;
  occupation: string;
  workplace: string;
  lineId: string;
  website: string;
  bio: string;
  profilePhoto: string | null;
  status: string;
  role: string;
};

type Props = {
  memberId: string;
  initialData: FormState;
  isSuperAdmin: boolean;
};

export default function AdminMemberEditForm({ memberId, initialData, isSuperAdmin }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          yearOfEntry: form.yearOfEntry,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด");
        return;
      }

      router.push(`/admin/members/${memberId}`);
      router.refresh();
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
            รูปโปรไฟล์
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            initialUrl={form.profilePhoto}
            initials={form.firstNameTh}
            onUpload={(url) => set("profilePhoto", url)}
          />
        </CardContent>
      </Card>

      {/* Name */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
            ชื่อ-นามสกุล
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstNameTh">ชื่อ (ไทย) <span className="text-destructive">*</span></Label>
            <Input
              id="firstNameTh"
              value={form.firstNameTh}
              onChange={(e) => set("firstNameTh", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastNameTh">นามสกุล (ไทย) <span className="text-destructive">*</span></Label>
            <Input
              id="lastNameTh"
              value={form.lastNameTh}
              onChange={(e) => set("lastNameTh", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstNameEn">ชื่อ (อังกฤษ)</Label>
            <Input
              id="firstNameEn"
              value={form.firstNameEn}
              onChange={(e) => set("firstNameEn", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastNameEn">นามสกุล (อังกฤษ)</Label>
            <Input
              id="lastNameEn"
              value={form.lastNameEn}
              onChange={(e) => set("lastNameEn", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">ชื่อเล่น</Label>
            <Input
              id="nickname"
              value={form.nickname}
              onChange={(e) => set("nickname", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-muted-foreground text-xs">ชื่อเดิม (กรณีเปลี่ยนชื่อ)</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="ชื่อเดิม"
                value={form.formerFirstName}
                onChange={(e) => set("formerFirstName", e.target.value)}
              />
              <Input
                placeholder="นามสกุลเดิม"
                value={form.formerLastName}
                onChange={(e) => set("formerLastName", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
            ข้อมูลการศึกษา
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="birthDate">
              วันเกิด <span className="text-destructive">*</span>
              <span className="ml-1 font-normal text-muted-foreground">(ค.ศ. เช่น 1990-01-31)</span>
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={form.birthDate}
              onChange={(e) => set("birthDate", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">ภาควิชา <span className="text-destructive">*</span></Label>
            <Select value={form.department} onValueChange={(v) => set("department", v)}>
              <SelectTrigger id="department">
                <SelectValue placeholder="เลือกภาควิชา" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENT_OPTIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearOfEntry">
              ปีที่เข้าศึกษา <span className="text-destructive">*</span>
              <span className="ml-1 font-normal text-muted-foreground">(พ.ศ.)</span>
            </Label>
            <Input
              id="yearOfEntry"
              type="number"
              min={2476}
              max={2600}
              value={form.yearOfEntry}
              onChange={(e) => set("yearOfEntry", e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
            ข้อมูลติดต่อ
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">โทรศัพท์</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">อาชีพ</Label>
            <Input
              id="occupation"
              value={form.occupation}
              onChange={(e) => set("occupation", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workplace">ที่ทำงาน</Label>
            <Input
              id="workplace"
              value={form.workplace}
              onChange={(e) => set("workplace", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lineId">LINE ID</Label>
            <Input
              id="lineId"
              value={form.lineId}
              onChange={(e) => set("lineId", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="website">เว็บไซต์</Label>
            <Input
              id="website"
              type="url"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bio">ประวัติย่อ</Label>
            <Textarea
              id="bio"
              rows={3}
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Admin controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
            การจัดการบัญชี
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status">สถานะสมาชิก</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="role">สิทธิ์ในระบบ</Label>
              <Select value={form.role} onValueChange={(v) => set("role", v)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          ยกเลิก
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </Button>
      </div>
    </form>
  );
}
