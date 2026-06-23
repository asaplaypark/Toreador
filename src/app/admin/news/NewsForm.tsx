"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import NewsCoverUpload from "@/components/NewsCoverUpload";

export type NewsFormValues = {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
  coverImage: string;
  visibility: string;
  status: string;
};

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "สาธารณะ — ทุกคนเห็น" },
  { value: "MEMBERS_ONLY", label: "สมาชิกเท่านั้น" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "ฉบับร่าง" },
  { value: "PUBLISHED", label: "เผยแพร่" },
  { value: "ARCHIVED", label: "เก็บถาวร" },
];

function slugPreview(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `news-[random]-${date}`;
}

export default function NewsForm({
  initialValues,
  newsId,
}: {
  initialValues?: Partial<NewsFormValues>;
  newsId?: string;
}) {
  const router = useRouter();
  const isEdit = !!newsId;

  const [form, setForm] = useState<NewsFormValues>({
    title: initialValues?.title ?? "",
    content: initialValues?.content ?? "",
    excerpt: initialValues?.excerpt ?? "",
    category: initialValues?.category ?? "",
    tags: initialValues?.tags ?? "",
    coverImage: initialValues?.coverImage ?? "",
    visibility: initialValues?.visibility ?? "PUBLIC",
    status: initialValues?.status ?? "DRAFT",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  function set(key: keyof NewsFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("กรุณากรอกหัวข้อข่าว");
      return;
    }
    if (!form.content.trim()) {
      setError("กรุณากรอกเนื้อหา");
      return;
    }

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = { ...form, tags };

    setLoading(true);

    const res = isEdit
      ? await fetch(`/api/admin/news/${newsId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "เกิดข้อผิดพลาด");
      return;
    }

    router.push("/admin/news");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Main content */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
            เนื้อหา
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">หัวข้อข่าว *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="หัวข้อข่าว"
              required
            />
            {form.title && (
              <p className="text-xs text-muted-foreground">
                slug: <span className="font-mono">{slugPreview()}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">สรุปย่อ</Label>
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="สรุปย่อสำหรับแสดงในหน้ารายการข่าว (ถ้าไม่กรอก จะไม่แสดงคำอธิบาย)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">เนื้อหา * (รองรับ HTML)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview((v) => !v)}
                className="text-xs"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="mr-1 size-3" /> ซ่อน Preview
                  </>
                ) : (
                  <>
                    <Eye className="mr-1 size-3" /> Preview
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="<p>เนื้อหาข่าว...</p>"
              rows={12}
              className="font-mono text-xs"
              required
            />
          </div>

          {showPreview && (
            <div className="rounded-lg border border-sepia-pale/60 bg-white p-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-sepia-mid">
                Preview
              </p>
              <div
                className="news-content text-sm"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meta */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
            ข้อมูลเพิ่มเติม
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">หมวดหมู่</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="เช่น ประกาศ, กิจกรรม, ทุนการศึกษา"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">แท็ก (คั่นด้วย ,)</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="สถาปัตย์, จุฬา, สมาคม"
              />
            </div>
          </div>

          <NewsCoverUpload
            value={form.coverImage}
            onChange={(url) => set("coverImage", url)}
          />
        </CardContent>
      </Card>

      {/* Publish settings */}
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>สถานะ</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading
            ? isEdit
              ? "กำลังบันทึก..."
              : "กำลังสร้าง..."
            : isEdit
              ? "บันทึกการแก้ไข"
              : "สร้างข่าว"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/news")}
        >
          ยกเลิก
        </Button>
      </div>
    </form>
  );
}
