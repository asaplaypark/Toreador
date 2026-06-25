"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, CheckCircle } from "lucide-react";

const FUNDS = [
  { value: "KATANYU", label: "กองทุนกตัญญูครูสถา" },
  { value: "STACARE", label: "กองทุนสถาอาทร" },
];

type Props = {
  defaultFund?: string;
  defaultName?: string;
  defaultEmail?: string;
};

export default function DonationForm({ defaultFund, defaultName, defaultEmail }: Props) {
  const [fund, setFund] = useState(defaultFund ?? "");
  const [donorName, setDonorName] = useState(defaultName ?? "");
  const [donorEmail, setDonorEmail] = useState(defaultEmail ?? "");
  const [donorPhone, setDonorPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [slip, setSlip] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }
    setSlip(file);
    setSlipPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!fund) { setError("กรุณาเลือกกองทุน"); return; }
    if (!donorName.trim()) { setError("กรุณากรอกชื่อผู้บริจาค"); return; }
    if (!donorEmail.trim()) { setError("กรุณากรอกอีเมล"); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("กรุณากรอกจำนวนเงิน"); return; }
    if (!slip) { setError("กรุณาแนบสลิปการโอนเงิน"); return; }

    setSubmitting(true);
    const fd = new FormData();
    fd.append("fund", fund);
    fd.append("donorName", donorName.trim());
    fd.append("donorEmail", donorEmail.trim());
    fd.append("donorPhone", donorPhone.trim());
    fd.append("amount", amount);
    fd.append("note", note.trim());
    fd.append("slip", slip);

    try {
      const res = await fetch("/api/donate", { method: "POST", body: fd });
      const text = await res.text();
      let d: { success?: boolean; error?: string } = {};
      try { d = JSON.parse(text); } catch { /* empty */ }

      if (!res.ok) {
        setError(d.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle className="size-12 text-green-600" />
          <h3 className="text-lg font-medium text-green-900">ส่งหลักฐานการบริจาคแล้ว</h3>
          <p className="text-sm text-green-700">
            ขอบคุณสำหรับการสนับสนุน เราจะตรวจสอบและยืนยันการบริจาคทางอีเมลของคุณ
          </p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => {
              setSuccess(false);
              setSlip(null);
              setSlipPreview(null);
              setAmount("");
              setNote("");
              setDonorPhone("");
              if (fileRef.current) fileRef.current.value = "";
            }}
          >
            บริจาคอีกครั้ง
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-charcoal">แจ้งการบริจาค</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Fund */}
          <div className="space-y-1.5">
            <Label>กองทุน <span className="text-destructive">*</span></Label>
            <Select value={fund} onValueChange={setFund}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกกองทุน" />
              </SelectTrigger>
              <SelectContent>
                {FUNDS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="donorName">ชื่อผู้บริจาค <span className="text-destructive">*</span></Label>
              <Input
                id="donorName"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="ชื่อ-นามสกุล"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="donorEmail">อีเมล <span className="text-destructive">*</span></Label>
              <Input
                id="donorEmail"
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="donorPhone">เบอร์โทรศัพท์</Label>
              <Input
                id="donorPhone"
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder="081-234-5678"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="amount">จำนวนเงิน (บาท) <span className="text-destructive">*</span></Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="เช่น 500"
              />
            </div>
          </div>

          {/* Slip upload */}
          <div className="space-y-1.5">
            <Label>สลิปการโอนเงิน <span className="text-destructive">*</span></Label>
            <div
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-sepia-pale/60 bg-sepia-cream/30 p-6 transition-colors hover:border-sepia/40 hover:bg-sepia-cream/50"
              onClick={() => fileRef.current?.click()}
            >
              {slipPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slipPreview}
                  alt="slip preview"
                  className="max-h-48 rounded-md object-contain"
                />
              ) : (
                <>
                  <Upload className="size-8 text-sepia-mid" />
                  <p className="text-sm text-muted-foreground">
                    คลิกเพื่อเลือกรูปสลิป (jpg, png ≤ 5MB)
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFile}
            />
            {slip && (
              <p className="text-xs text-muted-foreground">{slip.name} ({(slip.size / 1024).toFixed(0)} KB)</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="note">หมายเหตุ</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
              rows={2}
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "กำลังส่ง..." : "ส่งหลักฐานการบริจาค"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
