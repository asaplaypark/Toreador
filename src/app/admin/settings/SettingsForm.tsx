"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export type Setting = {
  key: string;
  value: string;
  label: string;
  type: string;
  group: string;
};

const GROUPS: { key: string; label: string }[] = [
  { key: "general", label: "ทั่วไป" },
  { key: "hero", label: "Hero" },
  { key: "about", label: "เกี่ยวกับ" },
  { key: "footer", label: "Footer" },
  { key: "theme", label: "ธีม" },
];

export default function SettingsForm({ settings }: { settings: Setting[] }) {
  const [activeGroup, setActiveGroup] = useState("general");
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.map((s) => [s.key, s.value]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const groupSettings = settings.filter((s) => s.group === activeGroup);

  function setValue(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    const updates = groupSettings.map((s) => ({ key: s.key, value: values[s.key] ?? "" }));
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      const d = await res.json();
      setError(d.error ?? "เกิดข้อผิดพลาด");
    }
  }

  function renderField(s: Setting) {
    const val = values[s.key] ?? "";

    if (s.type === "textarea") {
      return (
        <Textarea
          id={s.key}
          value={val}
          onChange={(e) => setValue(s.key, e.target.value)}
          rows={4}
        />
      );
    }

    if (s.type === "color") {
      return (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={val || "#000000"}
            onChange={(e) => setValue(s.key, e.target.value)}
            className="size-10 cursor-pointer rounded border border-sepia-pale/60 p-0.5"
          />
          <Input
            value={val}
            onChange={(e) => setValue(s.key, e.target.value)}
            className="w-32 font-mono text-sm"
            placeholder="#000000"
          />
          <div
            className="size-8 rounded border border-sepia-pale/60"
            style={{ backgroundColor: val || "transparent" }}
          />
        </div>
      );
    }

    if (s.type === "image") {
      return (
        <div className="space-y-2">
          <Input
            id={s.key}
            value={val}
            onChange={(e) => setValue(s.key, e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          {val && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={val}
              alt="preview"
              className="max-h-32 rounded-lg border border-sepia-pale/60 object-cover"
            />
          )}
        </div>
      );
    }

    if (s.type === "url") {
      return (
        <Input
          id={s.key}
          type="url"
          value={val}
          onChange={(e) => setValue(s.key, e.target.value)}
          placeholder="https://"
        />
      );
    }

    return (
      <Input
        id={s.key}
        value={val}
        onChange={(e) => setValue(s.key, e.target.value)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Group tabs */}
      <div className="flex flex-wrap gap-2 border-b border-sepia-pale/40 pb-4">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => { setActiveGroup(g.key); setSaved(false); setError(""); }}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeGroup === g.key
                ? "bg-sepia-dark text-sepia-cream"
                : "text-sepia hover:bg-sepia-cream"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Fields */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-sepia-mid">
            {GROUPS.find((g) => g.key === activeGroup)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {groupSettings.map((s) => (
            <div key={s.key} className="space-y-1.5">
              <Label htmlFor={s.key} className="text-sm font-medium text-charcoal">
                {s.label}
              </Label>
              {renderField(s)}
              {s.key === "hero_title" && (
                <p className="text-xs text-muted-foreground">
                  รองรับ HTML: <code className="rounded bg-muted px-1">&lt;br&gt;</code> ขึ้นบรรทัด,{" "}
                  <code className="rounded bg-muted px-1">&lt;strong&gt;</code> ตัวหนา
                </p>
              )}
              <p className="text-xs text-muted-foreground font-mono">{s.key}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "กำลังบันทึก..." : saved ? (
            <><Check className="mr-1 size-4" />บันทึกแล้ว</>
          ) : "บันทึก"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
