import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encode } from "next-auth/jwt";
import { NextResponse } from "next/server";

// POST /api/auth/link-line/prepare
// Called before LINE OAuth to mark which user wants to link.
// Sets a short-lived signed cookie so /api/auth/link-line can identify the original user.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const token = await encode({
    token: { userId: session.user.id, type: "link-line" },
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: 5 * 60, // 5 minutes
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("ll_tok", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 5 * 60,
  });
  return res;
}
