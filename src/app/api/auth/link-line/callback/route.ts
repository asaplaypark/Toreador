import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const CALLBACK_URL = `${process.env.NEXTAUTH_URL}/api/auth/link-line/callback`;

// GET /api/auth/link-line/callback
// LINE redirects here after the user approves. We exchange the code for a
// LINE access token, fetch the profile, then update the original user record
// identified via the `state` parameter (which holds the LinkingToken).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const fail = (msg: string) =>
    NextResponse.redirect(new URL(`/profile/edit?error=${encodeURIComponent(msg)}`, req.url));

  if (errorParam) {
    console.error("[link-line/callback] LINE returned error:", errorParam);
    return fail("line_cancelled");
  }

  if (!code || !state) {
    console.error("[link-line/callback] Missing code or state");
    return fail("link_failed");
  }

  // Look up the linking token
  const linkingToken = await prisma.linkingToken.findUnique({ where: { token: state } });
  console.log("[link-line/callback] linkingToken:", linkingToken);

  if (!linkingToken) {
    return fail("invalid-token");
  }
  if (linkingToken.expiresAt < new Date()) {
    await prisma.linkingToken.delete({ where: { token: state } }).catch(() => null);
    return fail("token-expired");
  }

  const { userId } = linkingToken;

  // Exchange code for LINE access token
  let lineAccessToken: string;
  try {
    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: CALLBACK_URL,
        client_id: process.env.LINE_CLIENT_ID!,
        client_secret: process.env.LINE_CLIENT_SECRET!,
      }),
    });
    const tokenData = await tokenRes.json();
    console.log("[link-line/callback] token exchange status:", tokenRes.status);
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[link-line/callback] token exchange failed:", tokenData);
      return fail("link_failed");
    }
    lineAccessToken = tokenData.access_token;
  } catch (e) {
    console.error("[link-line/callback] token exchange error:", e);
    return fail("link_failed");
  }

  // Fetch LINE profile
  let lineUserId: string;
  let lineDisplayName: string | null;
  let linePictureUrl: string | null;
  try {
    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${lineAccessToken}` },
    });
    const profile = await profileRes.json();
    console.log("[link-line/callback] LINE profile userId:", profile.userId);
    if (!profile.userId) return fail("link_failed");
    lineUserId = profile.userId;
    lineDisplayName = profile.displayName ?? null;
    linePictureUrl = profile.pictureUrl ?? null;
  } catch (e) {
    console.error("[link-line/callback] profile fetch error:", e);
    return fail("link_failed");
  }

  // Check if this LINE account is already linked to a different user
  const existing = await prisma.user.findUnique({ where: { lineUserId }, select: { id: true } });
  if (existing && existing.id !== userId) {
    console.warn("[link-line/callback] lineUserId already linked to another user");
    await prisma.linkingToken.delete({ where: { token: state } }).catch(() => null);
    return fail("line_already_linked");
  }

  // Update the original user with LINE data
  await prisma.user.update({
    where: { id: userId },
    data: { lineUserId, lineDisplayName, linePictureUrl },
  });
  console.log("[link-line/callback] linked LINE to userId:", userId);

  // Clean up the token
  await prisma.linkingToken.delete({ where: { token: state } }).catch(() => null);

  return NextResponse.redirect(new URL("/profile/edit?linked=1", req.url));
}
