import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import LineProvider from "next-auth/providers/line";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // No adapter — we use JWT sessions and manage our own User model
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "อีเมล", type: "email" },
        password: { label: "รหัสผ่าน", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;
        if (user.accountStatus !== "ACTIVE") return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return { id: user.id, email: user.email, role: user.role };
      },
    }),

    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "line") return true;

      const lineUserId = account.providerAccountId;
      const lineProfile = profile as {
        userId?: string;
        displayName?: string;
        pictureUrl?: string;
        email?: string;
      } | undefined;
      const lineDisplayName = lineProfile?.displayName ?? null;
      const linePictureUrl = lineProfile?.pictureUrl ?? null;
      const email = user.email ?? null;

      // 1. Try to find by lineUserId
      let dbUser = await prisma.user.findUnique({ where: { lineUserId } });

      // 2. If not found, try to match by email
      if (!dbUser && email) {
        dbUser = await prisma.user.findUnique({ where: { email } });
      }

      if (dbUser) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            lineUserId,
            lineDisplayName,
            linePictureUrl,
            lastLoginAt: new Date(),
            ...(dbUser.accountStatus === "UNACTIVATED"
              ? { accountStatus: "ACTIVE" }
              : {}),
          },
        });
      } else {
        // New user via LINE
        await prisma.user.create({
          data: {
            email,
            lineUserId,
            lineDisplayName,
            linePictureUrl,
            accountStatus: "ACTIVE",
            consentGiven: false,
            lastLoginAt: new Date(),
          },
        });
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // Credentials sign-in: user object is present with our DB fields
      if (user && account?.provider === "credentials") {
        token.id = user.id;
        token.role = (user as { id: string; role?: string }).role;
        return token;
      }

      // LINE sign-in (first time): look up our DB user by lineUserId
      if (account?.provider === "line") {
        const lineUserId = account.providerAccountId;
        const dbUser = await prisma.user.findUnique({
          where: { lineUserId },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
        return token;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
