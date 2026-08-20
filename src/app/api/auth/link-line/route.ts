import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getToken, encode, decode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/auth/link-line
// NextAuth redirects here after LINE OAuth when called from the "เชื่อมต่อ LINE" button.
// Links the LINE account to the user who initiated the flow (stored in ll_tok cookie).
export async function GET(req: NextRequest) {
  const failRedirect = (msg: string) =>
    NextResponse.redirect(new URL(`/profile/edit?error=${encodeURIComponent(msg)}`, req.url));

  // Read the prepare cookie (set before LINE OAuth)
  const llTok = req.cookies.get("ll_tok")?.value;
  if (!llTok) {
    // No prepare cookie → regular LINE login, not a link; go to dashboard
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Decode prepare cookie to get original userId
  let originalUserId: string | undefined;
  try {
    const decoded = await decode({ token: llTok, secret: process.env.NEXTAUTH_SECRET! });
    if (decoded?.type !== "link-line" || typeof decoded.userId !== "string") throw new Error();
    originalUserId = decoded.userId as string;
  } catch {
    return failRedirect("invalid-token");
  }

  // Get the current session (now the LINE user after OAuth)
  const session = await getServerSession(authOptions);
  const lineSessionUserId = session?.user?.id;
  if (!lineSessionUserId) return failRedirect("no-session");

  // Same user: signIn callback already linked via email match → just clear cookie
  if (lineSessionUserId === originalUserId) {
    return successRedirect(req);
  }

  // Different user: get LINE data from the new session's user record
  const lineUser = await prisma.user.findUnique({
    where: { id: lineSessionUserId },
    select: { lineUserId: true, lineDisplayName: true, linePictureUrl: true },
  });
  if (!lineUser?.lineUserId) return failRedirect("no-line-data");

  // Update original user with LINE data
  const originalUser = await prisma.user.findUnique({
    where: { id: originalUserId },
    select: { id: true, role: true },
  });
  if (!originalUser) return failRedirect("original-user-not-found");

  await prisma.user.update({
    where: { id: originalUserId },
    data: {
      lineUserId: lineUser.lineUserId,
      lineDisplayName: lineUser.lineDisplayName,
      linePictureUrl: lineUser.linePictureUrl,
    },
  });

  // Clean up temp LINE user if it has no Member record
  const lineUserMember = await prisma.member.findUnique({
    where: { userId: lineSessionUserId },
  });
  if (!lineUserMember) {
    await prisma.user.delete({ where: { id: lineSessionUserId } }).catch(() => null);
  }

  // Re-sign the JWT as the original user
  const currentToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
  const newJwt = await encode({
    token: {
      ...currentToken,
      id: originalUserId,
      role: originalUser.role,
      sub: originalUserId,
    },
    secret: process.env.NEXTAUTH_SECRET!,
  });

  // Set session cookie for original user
  const isSecure = process.env.NODE_ENV === "production";
  const cookieName = isSecure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const res = NextResponse.redirect(new URL("/profile/edit?linked=1", req.url));
  res.cookies.set(cookieName, newJwt, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  res.cookies.delete("ll_tok");
  return res;
}

function successRedirect(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/profile/edit?linked=1", req.url));
  res.cookies.delete("ll_tok");
  return res;
}
