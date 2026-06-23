"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <Image
        src="/logo.jpg"
        alt="Toreador logo"
        width={80}
        height={80}
        className="mb-4 rounded-full object-cover"
        priority
      />
      <h1 className="mb-1 text-2xl font-medium text-charcoal">เข้าสู่ระบบ</h1>
      <p className="mb-6 text-sm text-muted-foreground">กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ</p>

      <Card className="w-full">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            {justRegistered && (
              <div className="rounded-md bg-sepia-cream px-3 py-2 text-sm text-sepia">
                สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              ยังไม่มีบัญชี?{" "}
              <Link href="/register" className="text-sepia underline-offset-4 hover:underline font-medium">
                สมัครสมาชิก
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-sepia-bg px-4 py-6 sm:py-12">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
