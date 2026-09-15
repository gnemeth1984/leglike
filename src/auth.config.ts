import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config — used by middleware (which runs on the Edge
 * runtime). Must NOT import anything that needs Node APIs: no bcryptjs
 * (needs `crypto`), no Prisma (needs a Node socket). Those live in the
 * Credentials provider in `auth.ts` instead, which only runs in Node-runtime
 * route handlers and server actions.
 *
 * Previously this file also held the Credentials provider directly, and
 * middleware imported it via `@/auth`. bcryptjs/Prisma silently break on
 * Edge, which broke JWT/session reads in middleware — every protected page
 * looked logged-out and bounced back to /auth/signin on every navigation.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.plan = (user as any).plan;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).plan = token.plan as string;
      }
      return session;
    },
  },
};
