/**
 * Rehab guide SEO page generator. Data-driven off a fixed condition list
 * (@/lib/seo/rehabGuides REHAB_CONDITIONS), not a keyword queue — each run
 * writes the next condition(s) without a guide yet, or refreshes the
 * thinnest existing guide once the list is exhausted.
 *
 * GET  /api/cron/generate-rehab-guides?secret=CRON_SECRET   (Vercel Cron)
 * POST /api/cron/generate-rehab-guides                      (admin dashboard button)
 */

import { NextResponse } from "next/server";
import { generateNextRehabGuides, refreshThinnestRehabGuide } from "@/lib/seo/rehabGuides";
import { canRunSeo } from "@/lib/seo/auth";
import { wrapCron } from "@/lib/cron-run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function run(req: Request) {
  if (!(await canRunSeo(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await generateNextRehabGuides(2);
    if (result.written.length > 0) {
      return NextResponse.json({ success: true, source: "new-guides", written: result.written });
    }

    const refreshed = await refreshThinnestRehabGuide();
    if (refreshed.refreshed) {
      return NextResponse.json({ success: true, source: "refresh", slug: refreshed.slug });
    }

    console.warn("[RehabGuides] Nothing to do (%s)", result.reason ?? refreshed.reason);
    return NextResponse.json({ success: false, reason: result.reason ?? refreshed.reason });
  } catch (err: any) {
    console.error("[cron/generate-rehab-guides]", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

const __wrapped = wrapCron("generate-rehab-guides", run as any);
export const GET = __wrapped;
export const POST = __wrapped;
