/**
 * Shared auth for the SEO autopilot endpoints.
 *
 * Accepts either the cron secret (Vercel Cron sends it as a Bearer header) or a
 * logged-in admin session, so the same route works unattended and from the
 * /admin SEO tab's "run now" buttons.
 *
 * LegLike has no multi-tenant/platform-admin concept — just Role.USER /
 * Role.ADMIN on User — so this gates on role === "ADMIN" directly, unlike
 * Rotahr which needs a separate platform-admin flag to avoid handing every
 * business owner the whole platform's SEO console.
 */

import { auth } from "@/auth";

export function hasCronSecret(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  const alt = req.headers.get("x-cron-secret") || new URL(req.url).searchParams.get("secret");
  return header === `Bearer ${secret}` || alt === secret;
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return (session?.user as { role?: string } | undefined)?.role === "ADMIN";
}

/** True when the caller may run/inspect the autopilot. */
export async function canRunSeo(req: Request): Promise<boolean> {
  return hasCronSecret(req) || (await isAdmin());
}
