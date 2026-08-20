import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const LINE_OAUTH_URL = "https://access.line.me/oauth2/v2.1/authorize";
const CALLBACK_URL = `${process.env.NEXTAUTH_URL}/api/auth/link-line/callback`;
const TOKEN_TTL_SECONDS = 5 * 60; // 5 minutes

// POST /api/auth/link-line/prepare
// Creates a LinkingToken in DB and redirects the browser to LINE OAuth.
// The token is passed as LINE's `state` parameter so the callback can
// look up who initiated the link without relying on cookies or sessions.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000);

  await prisma.linkingToken.create({
    data: { userId: session.user.id, token, expiresAt },
  });

  const params = new URLSearchParams({
    client_id: process.env.LINE_CLIENT_ID!,
    redirect_uri: CALLBACK_URL,
    response_type: "code",
    scope: "openid profile",
    state: token,
  });

  return NextResponse.json({ url: `${LINE_OAUTH_URL}?${params}` });
}
