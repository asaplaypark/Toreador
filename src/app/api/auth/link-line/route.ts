import { getToken, encode, decode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/auth/link-line
// NextAuth redirects here after LINE OAuth when initiated from "เชื่อมต่อ LINE" button.
// Links the LINE account to the user who initiated the flow (stored in ll_tok cookie).
export async function GET(req: NextRequest) {
  const failRedirect = (msg: string) => {
    console.error("[link-line] fail:", msg);
    return NextResponse.redirect(new URL(`/profile/edit?error=${encodeURIComponent(msg)}`, req.url));
  };

  try {
    // Read the prepare cookie (set before LINE OAuth)
    const llTok = req.cookies.get("ll_tok")?.value;
    console.log("[link-line] ll_tok present:", !!llTok);

    if (!llTok) {
      // No prepare cookie → regular LINE login, not a linking request
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Decode prepare cookie → originalUserId
    let originalUserId: string;
    try {
      const decoded = await decode({ token: llTok, secret: process.env.NEXTAUTH_SECRET! });
      console.log("[link-line] decoded ll_tok:", decoded);
      if (!decoded || decoded.type !== "link-line" || typeof decoded.userId !== "string") {
        return failRedirect("invalid-token");
      }
      originalUserId = decoded.userId;
    } catch (e) {
      console.error("[link-line] decode error:", e);
      return failRedirect("invalid-token");
    }

    // Get current JWT directly from request cookies (the LINE user after OAuth)
    const currentToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    console.log("[link-line] currentToken id:", currentToken?.id, "originalUserId:", originalUserId);

    if (!currentToken?.id) {
      return failRedirect("no-session");
    }

    const lineSessionUserId = currentToken.id as string;

    // Same user: signIn callback already linked via email match → just clear cookie
    if (lineSessionUserId === originalUserId) {
      console.log("[link-line] same user, already linked");
      return successRedirect(req);
    }

    // Different user: get LINE data from the session's user record
    const lineUser = await prisma.user.findUnique({
      where: { id: lineSessionUserId },
      select: { lineUserId: true, lineDisplayName: true, linePictureUrl: true },
    });
    console.log("[link-line] lineUser:", lineUser);

    if (!lineUser?.lineUserId) return failRedirect("no-line-data");

    // Fetch original user
    const originalUser = await prisma.user.findUnique({
      where: { id: originalUserId },
      select: { id: true, role: true },
    });
    if (!originalUser) return failRedirect("original-user-not-found");

    // Transfer LINE data to original user
    await prisma.user.update({
      where: { id: originalUserId },
      data: {
        lineUserId: lineUser.lineUserId,
        lineDisplayName: lineUser.lineDisplayName,
        linePictureUrl: lineUser.linePictureUrl,
      },
    });
    console.log("[link-line] updated original user with LINE data");

    // Clean up temp LINE user if it has no Member record
    const lineUserMember = await prisma.member.findUnique({ where: { userId: lineSessionUserId } });
    if (!lineUserMember) {
      await prisma.user.delete({ where: { id: lineSessionUserId } }).catch(() => null);
      console.log("[link-line] deleted temp LINE user");
    }

    // Re-sign JWT as original user
    const newJwt = await encode({
      token: {
        ...currentToken,
        id: originalUserId,
        role: originalUser.role,
        sub: originalUserId,
      },
      secret: process.env.NEXTAUTH_SECRET!,
    });

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
    console.log("[link-line] success, redirecting to /profile/edit?linked=1");
    return res;
  } catch (e) {
    console.error("[link-line] unhandled error:", e);
    return NextResponse.redirect(new URL("/profile/edit?error=link_failed", req.url));
  }
}

function successRedirect(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/profile/edit?linked=1", req.url));
  res.cookies.delete("ll_tok");
  return res;
}
