"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, CheckCircle2, AlertCircle, XCircle, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";

const DEPT_OPTIONS = [
  { value: "ARCHITECTURE", label: "สถาปัตยกรรมศาสตร์" },
  { value: "INTERIOR_ARCHITECTURE", label: "สถาปัตยกรรมภายใน" },
  { value: "LANDSCAPE_ARCHITECTURE", label: "ภูมิสถาปัตยกรรม" },
  { value: "INDUSTRIAL_DESIGN", label: "การออกแบบอุตสาหกรรม" },
  { value: "URBAN_PLANNING", label: "การวางแผนภาคและผังเมือง" },
  { value: "COMMDE", label: "CommDe" },
  { value: "INDA", label: "INDA" },
  { value: "THAI_ARCHITECTURE", label: "สถาปัตยกรรมไทย" },
];

type ParsedRow = {
  index: number;
  firstNameTh: string;
  lastNameTh: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  yearOfEntry: number | null;
  department: string | null;
  departmentRaw: string;
  occupation: string | null;
  workplace: string | null;
  consent: boolean;
  status: "ready" | "needs_review" | "error";
  errors: string[];
};

type Step = "upload" | "review" | "result";

type ImportResult = {
  imported: number;
  skipped: number;
  errors: { name: string; reason: string }[];
  batchId: string;
};

export default function ImportWizard() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewRaw, setPreviewRaw] = useState<string[][]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [manualDept, setManualDept] = useState<Record<number, string>>({});
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Step 1: Upload & Preview ──────────────────────────────────────────────

  async function handlePreview() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/import/preview", { method: "POST", body: fd });
      const data = await res.json() as { rows?: ParsedRow[]; previewRaw?: string[][]; error?: string };
      if (!res.ok) { setError(data.error ?? "เกิดข้อผิดพลาด"); return; }
      setRows(data.rows ?? []);
      setPreviewRaw(data.previewRaw ?? []);
      setManualDept({});
      setSkipped(new Set());
      setStep("review");
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Review ────────────────────────────────────────────────────────

  function toggleSkip(index: number) {
    setSkipped((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  const readyCount = rows.filter(
    (r) => !skipped.has(r.index) && (r.status === "ready" || (r.status === "needs_review" && manualDept[r.index]))
  ).length;
  const needsReviewCount = rows.filter(
    (r) => !skipped.has(r.index) && r.status === "needs_review" && !manualDept[r.index]
  ).length;
  const errorCount = rows.filter((r) => !skipped.has(r.index) && r.status === "error").length;
  const skippedCount = skipped.size;
  const canImport = readyCount > 0 && needsReviewCount === 0 && errorCount === 0;

  // ── Step 3: Execute ───────────────────────────────────────────────────────

  async function handleImport() {
    setLoading(true);
    setError("");
    setProgress(10);

    const toImport = rows
      .filter((r) => {
        if (skipped.has(r.index)) return false;
        if (r.status === "error") return false;
        const dept = r.department ?? manualDept[r.index];
        return !!dept;
      })
      .map((r) => ({
        firstNameTh: r.firstNameTh,
        lastNameTh: r.lastNameTh,
        nickname: r.nickname,
        email: r.email,
        phone: r.phone,
        yearOfEntry: r.yearOfEntry!,
        department: r.department ?? manualDept[r.index],
        occupation: r.occupation,
        workplace: r.workplace,
        consent: r.consent,
      }));

    setProgress(30);

    try {
      const res = await fetch("/api/admin/import/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchName: file?.name ?? "Import",
          rows: toImport,
        }),
      });
      setProgress(90);
      const data = await res.json() as ImportResult & { error?: string };
      if (!res.ok) { setError(data.error ?? "เกิดข้อผิดพลาด"); setLoading(false); return; }
      setResult(data);
      setProgress(100);
      setStep("result");
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("upload");
    setFile(null);
    setRows([]);
    setPreviewRaw([]);
    setManualDept({});
    setSkipped(new Set());
    setError("");
    setResult(null);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(["upload", "review", "result"] as Step[]).map((s, i) => {
          const labels = ["1. อัปโหลด", "2. ตรวจสอบ", "3. ผลลัพธ์"];
          const active = step === s;
          const done =
            (s === "upload" && (step === "review" || step === "result")) ||
            (s === "review" && step === "result");
          return (
            <span key={s} className="flex items-center gap-2">
              {i > 0 && <ArrowRight className="size-3 text-muted-foreground" />}
              <span
                className={[
                  "rounded-full px-3 py-0.5 text-xs font-medium",
                  active ? "bg-sepia text-white" : done ? "bg-sepia-pale/60 text-sepia-dark" : "text-muted-foreground",
                ].join(" ")}
              >
                {labels[i]}
              </span>
            </span>
          );
        })}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* ── Step 1: Upload ── */}
      {step === "upload" && (
        <div className="space-y-5">
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-sepia-pale bg-sepia-cream/30 px-6 py-12 cursor-pointer hover:border-sepia/50 hover:bg-sepia-cream/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-8 text-sepia-pale" />
            {file ? (
              <>
                <p className="font-medium text-charcoal">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB — คลิกเพื่อเปลี่ยนไฟล์
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-charcoal">คลิกเพื่อเลือกไฟล์ CSV</p>
                <p className="text-sm text-muted-foreground">ไฟล์ CSV จาก Google Sheets</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setFile(f); setError(""); }
              }}
            />
          </div>

          {/* Raw preview */}
          {previewRaw.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-sepia-pale">
              <table className="w-full text-xs">
                <tbody>
                  {previewRaw.slice(0, 6).map((row, ri) => (
                    <tr key={ri} className={ri === 0 ? "bg-sepia-cream/60 font-medium" : "odd:bg-white even:bg-sepia-cream/20"}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 border-b border-sepia-pale/30 max-w-[120px] truncate">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handlePreview} disabled={!file || loading}>
              {loading ? (
                <><Loader2 className="size-4 mr-2 animate-spin" />กำลังตรวจสอบ...</>
              ) : (
                "ตรวจสอบข้อมูล"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Review ── */}
      {step === "review" && (
        <div className="space-y-5">
          {/* Summary chips */}
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-green-800 text-xs font-medium">
              <CheckCircle2 className="size-3.5" /> พร้อม {readyCount} คน
            </span>
            {needsReviewCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-amber-800 text-xs font-medium">
                <AlertCircle className="size-3.5" /> ต้องยืนยัน {needsReviewCount} คน
              </span>
            )}
            {errorCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-red-800 text-xs font-medium">
                <XCircle className="size-3.5" /> มีปัญหา {errorCount} คน
              </span>
            )}
            {skippedCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-gray-600 text-xs font-medium">
                ข้าม {skippedCount} คน
              </span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-sepia-pale">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="bg-sepia-cream/60 text-left text-sepia-dark">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">ชื่อ-นามสกุล</th>
                  <th className="px-3 py-2 font-medium">อีเมล</th>
                  <th className="px-3 py-2 font-medium">ปี (พ.ศ.)</th>
                  <th className="px-3 py-2 font-medium">สาขา</th>
                  <th className="px-3 py-2 font-medium">สถานะ</th>
                  <th className="px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isSkipped = skipped.has(row.index);
                  const resolvedDept = row.department ?? manualDept[row.index] ?? null;
                  return (
                    <tr
                      key={row.index}
                      className={[
                        "border-t border-sepia-pale/30",
                        isSkipped ? "opacity-40 bg-gray-50" : "odd:bg-white even:bg-sepia-cream/10",
                      ].join(" ")}
                    >
                      <td className="px-3 py-2 text-muted-foreground">{row.index}</td>
                      <td className="px-3 py-2">
                        <span className="font-medium">{row.firstNameTh} {row.lastNameTh}</span>
                        {row.nickname && (
                          <span className="ml-1 text-muted-foreground">({row.nickname})</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{row.email ?? "—"}</td>
                      <td className="px-3 py-2">{row.yearOfEntry ?? "—"}</td>
                      <td className="px-3 py-2">
                        {row.status === "needs_review" && !isSkipped ? (
                          <Select
                            value={manualDept[row.index] ?? ""}
                            onValueChange={(v) =>
                              setManualDept((prev) => ({ ...prev, [row.index]: v }))
                            }
                          >
                            <SelectTrigger className="h-7 w-[180px] text-xs border-amber-300">
                              <SelectValue placeholder={`"${row.departmentRaw}" → เลือก`} />
                            </SelectTrigger>
                            <SelectContent>
                              {DEPT_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value} className="text-xs">
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-muted-foreground">
                            {resolvedDept
                              ? DEPT_OPTIONS.find((o) => o.value === resolvedDept)?.label ?? resolvedDept
                              : row.departmentRaw || "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.status === "ready" && !isSkipped && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">✅ พร้อม</Badge>
                        )}
                        {row.status === "needs_review" && !isSkipped && !manualDept[row.index] && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">⚠️ ต้องยืนยัน</Badge>
                        )}
                        {row.status === "needs_review" && !isSkipped && manualDept[row.index] && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">✅ พร้อม</Badge>
                        )}
                        {row.status === "error" && !isSkipped && (
                          <Badge
                            className="bg-red-100 text-red-800 border-red-200 text-xs"
                            title={row.errors.join(", ")}
                          >
                            ❌ {row.errors[0]}
                          </Badge>
                        )}
                        {isSkipped && (
                          <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">ข้าม</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => toggleSkip(row.index)}
                          className="text-xs text-sepia hover:text-sepia-dark underline underline-offset-2"
                        >
                          {isSkipped ? "ยกเลิกข้าม" : "ข้าม"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {needsReviewCount > 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              มี {needsReviewCount} แถวที่ยังไม่ได้เลือกสาขา — กรุณาเลือกสาขาในช่อง dropdown หรือกด "ข้าม"
            </p>
          )}

          {/* Progress bar while importing */}
          {loading && (
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> กำลังนำเข้าข้อมูล...
              </p>
              <div className="h-2 rounded-full bg-sepia-pale/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sepia transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="size-4 mr-1.5" />
              เริ่มใหม่
            </Button>
            <Button onClick={handleImport} disabled={!canImport || loading}>
              {loading ? (
                <><Loader2 className="size-4 mr-2 animate-spin" />กำลังนำเข้า...</>
              ) : (
                `นำเข้าสมาชิก ${readyCount} คน`
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Result ── */}
      {step === "result" && result && (
        <div className="space-y-5">
          <div className="rounded-xl border border-sepia-pale bg-white p-6 space-y-4">
            <h2 className="font-medium text-charcoal text-lg">ผลการนำเข้า</h2>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-3xl font-semibold text-green-700">{result.imported}</p>
                <p className="text-xs text-green-600 mt-1">นำเข้าสำเร็จ</p>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <p className="text-3xl font-semibold text-gray-600">{result.skipped}</p>
                <p className="text-xs text-gray-500 mt-1">ข้าม (อีเมลซ้ำ)</p>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-3xl font-semibold text-red-600">{result.errors.length}</p>
                <p className="text-xs text-red-500 mt-1">ผิดพลาด</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 space-y-1">
                <p className="text-xs font-medium text-red-800">รายการที่ผิดพลาด:</p>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-700">
                    • {e.name}: {e.reason}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/members">ดูรายชื่อที่ import</Link>
            </Button>
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="size-4 mr-1.5" />
              Import ใหม่
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
