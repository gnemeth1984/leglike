/**
 * GET /api/admin/seo/content-counts — counts for the two data-driven SEO
 * content types (exercise pages, rehab guides). Split from the main
 * /api/admin/seo payload since these aren't keyword-queue driven and don't
 * fit that shape.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/seo/auth";
import { REHAB_CONDITIONS } from "@/lib/seo/rehabGuides";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [exercisesTotal, exercisesWithPage, rehabGuidesLive] = await Promise.all([
    prisma.exercise.count(),
    prisma.exercise.count({ where: { published: true } }),
    prisma.rehabGuide.count({ where: { published: true } }),
  ]);

  return NextResponse.json({
    exercises: { total: exercisesTotal, withPage: exercisesWithPage },
    rehabGuides: { live: rehabGuidesLive, total: REHAB_CONDITIONS.length },
  });
}
