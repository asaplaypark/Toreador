"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DEPARTMENTS = [
  { value: "ARCHITECTURE", label: "สถาปัตยกรรมศาสตร์" },
  { value: "INTERIOR_ARCHITECTURE", label: "สถาปัตยกรรมภายใน" },
  { value: "LANDSCAPE_ARCHITECTURE", label: "ภูมิสถาปัตยกรรม" },
  { value: "INDUSTRIAL_DESIGN", label: "การออกแบบอุตสาหกรรม" },
  { value: "URBAN_PLANNING", label: "การวางแผนภาคและผังเมือง" },
  { value: "COMMDE", label: "CommDe" },
  { value: "INDA", label: "INDA" },
] as const;

type FormState = {
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  birthDate: string;
  department: string;
  yearOfEntry: string;
  phone: string;
  occupation: string;
  workplace: string;
  lineId: string;
  website: string;
  bio: string;
  consentGiven: boolean;
};

const INITIAL: FormState = {
  firstNameTh: "",
  lastNameTh: "",
  firstNameEn: "",
  lastNameEn: "",
  birthDate: "",
  department: "",
  yearOfEntry: "",
  phone: "",
  occupation: "",
  workplace: "",
  lineId: "",
  website: "",
  bio: "",
  consentGiven: false,
};

function computeGeneration(yearOfEntry: string): string {
  const year = parseInt(yearOfEntry, 10);
  if (!year || year < 2476) return "-";
  const gen = year - 2475;
  return `รุ่นที่ ${gen}`;
}

export default function MemberRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.consentGiven) {
      setError("กรุณายินยอมนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) ก่อน");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/member/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ข้อมูลชื่อ */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลชื่อ</CardTitle>
          <CardDescription>
            ชื่อและนามสกุลที่ใช้ในทะเบียนนักศึกษา
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstNameTh">
              ชื่อ (ภาษาไทย) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstNameTh"
              value={form.firstNameTh}
              onChange={(e) => set("firstNameTh", e.target.value)}
              placeholder="เช่น สมชาย"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastNameTh">
              นามสกุล (ภาษาไทย) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastNameTh"
              value={form.lastNameTh}
              onChange={(e) => set("lastNameTh", e.target.value)}
              placeholder="เช่น ใจดี"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstNameEn">ชื่อ (ภาษาอังกฤษ)</Label>
            <Input
              id="firstNameEn"
              value={form.firstNameEn}
              onChange={(e) => set("firstNameEn", e.target.value)}
              placeholder="e.g. Somchai"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastNameEn">นามสกุล (ภาษาอังกฤษ)</Label>
            <Input
              id="lastNameEn"
              value={form.lastNameEn}
              onChange={(e) => set("lastNameEn", e.target.value)}
              placeholder="e.g. Jaidee"
            />
          </div>
        </CardContent>
      </Card>

      {/* ข้อมูลการศึกษา */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลการศึกษา</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="department">
              ภาควิชา <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.department}
              onValueChange={(v) => set("department", v)}
              required
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="เลือกภาควิชา" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearOfEntry">
              ปีที่เข้าศึกษา (พ.ศ.) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="yearOfEntry"
              type="number"
              value={form.yearOfEntry}
              onChange={(e) => set("yearOfEntry", e.target.value)}
              placeholder="เช่น 2540"
              min={2476}
              max={2600}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm">
              <span className="text-muted-foreground">รุ่นที่:</span>
              <span className="font-semibold text-foreground">
                {computeGeneration(form.yearOfEntry)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ข้อมูลส่วนตัว */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลส่วนตัว</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="birthDate">
              วันเดือนปีเกิด <span className="text-destructive">*</span>
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
            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="เช่น 081-234-5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">อาชีพปัจจุบัน</Label>
            <Input
              id="occupation"
              value={form.occupation}
              onChange={(e) => set("occupation", e.target.value)}
              placeholder="เช่น สถาปนิก"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workplace">ที่ทำงาน</Label>
            <Input
              id="workplace"
              value={form.workplace}
              onChange={(e) => set("workplace", e.target.value)}
              placeholder="เช่น บริษัท ABC จำกัด"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lineId">LINE ID</Label>
            <Input
              id="lineId"
              value={form.lineId}
              onChange={(e) => set("lineId", e.target.value)}
              placeholder="เช่น @somchai"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">เว็บไซต์</Label>
            <Input
              id="website"
              type="url"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bio">แนะนำตัว</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="เล่าเกี่ยวกับตัวเองสักเล็กน้อย..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* PDPA Consent */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={form.consentGiven}
              onCheckedChange={(checked) =>
                set("consentGiven", checked === true)
              }
            />
            <Label
              htmlFor="consent"
              className="cursor-pointer text-sm leading-relaxed"
            >
              ข้าพเจ้ายินยอมให้สมาคมศิษย์เก่าคณะสถาปัตยกรรมศาสตร์
              จุฬาลงกรณ์มหาวิทยาลัย เก็บรวบรวม และใช้ข้อมูลส่วนบุคคลของข้าพเจ้า
              เพื่อวัตถุประสงค์ในการบริหารจัดการสมาชิก และการติดต่อสื่อสาร
              ตามภารกิจของสมาคมฯ ตาม{" "}
              <span className="font-medium text-primary">
                นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
              </span>{" "}
              <span className="text-destructive">*</span>
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? "กำลังบันทึก..." : "ยืนยันการลงทะเบียน"}
        </Button>
      </div>
    </form>
  );
}
