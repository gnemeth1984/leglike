/**
 * Exercise SEO page generator. Data-driven, not keyword-driven: the ~60 rows
 * in `Exercise` already exist, so each run either writes pages for the next
 * few that don't have one yet, or — once every exercise has a page — refreshes
 * the thinnest existing page instead.
 *
 * GET  /api/cron/generate-exercise-pages?secret=CRON_SECRET   (Vercel Cron)
 * POST /api/cron/generate-exercise-pages                      (admin dashboard button)
 */

import { NextResponse } from "next/server";
import { generateNextExercisePages, refreshThinnestExercisePage } from "@/lib/seo/exercisePages";
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
    const result = await generateNextExercisePages(2);
    if (result.written.length > 0) {
      return NextResponse.json({ success: true, source: "new-pages", written: result.written });
    }

    // Every exercise already has a page — use the run to thicken the
    // thinnest one instead of doing nothing.
    const refreshed = await refreshThinnestExercisePage();
    if (refreshed.refreshed) {
      return NextResponse.json({ success: true, source: "refresh", slug: refreshed.slug });
    }

    console.warn("[ExercisePages] Nothing to do (%s)", result.reason ?? refreshed.reason);
    return NextResponse.json({ success: false, reason: result.reason ?? refreshed.reason });
  } catch (err: any) {
    console.error("[cron/generate-exercise-pages]", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

const __wrapped = wrapCron("generate-exercise-pages", run as any);
export const GET = __wrapped;
export const POST = __wrapped;
