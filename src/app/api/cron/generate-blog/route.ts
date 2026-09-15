/**
 * Daily blog publish. Keyword-driven only — every article is written for a
 * specific query harvested from Google Suggest / Search Console via the SEO
 * autopilot (@/lib/seo/autopilot), never off a hand-maintained topic list.
 *
 * Order of operations:
 *  1. Repair any published post that's missing a cover image (third-party
 *     image gen can fail for one run without leaving the post blank forever).
 *  2. Publish a hand-written article if one was queued (published: false,
 *     createdAt in the past) — those exist because some claims (pricing,
 *     features, limitations) need real product facts a model must not invent.
 *  3. Otherwise pull the next keyword off the queue and write it. If the queue
 *     is empty, harvest once and retry immediately so the blog never misses a
 *     day just because the pipeline ran dry.
 *
 * GET  /api/cron/generate-blog?secret=CRON_SECRET   (Vercel Cron)
 * POST /api/cron/generate-blog                      (admin dashboard button)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCoverImage } from "@/lib/blog/cover-image";
import { publishNextArticle, harvestKeywords } from "@/lib/seo/autopilot";
import { canRunSeo } from "@/lib/seo/auth";
import { wrapCron } from "@/lib/cron-run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // article + FAQ expansion + cover image

/**
 * Give any published post that has no cover another chance. Capped per run so
 * a long backlog is worked through over several days instead of blowing
 * maxDuration.
 */
async function repairMissingCovers(limit = 1) {
  const coverless = await prisma.blogPost.findMany({
    where: { published: true, OR: [{ coverImage: null }, { coverImage: "" }] },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, title: true, category: true, slug: true },
  });

  const repaired: string[] = [];
  for (const post of coverless) {
    const cover = await generateCoverImage(post.title, post.category).catch(() => null);
    if (!cover) continue;
    await prisma.blogPost.update({ where: { id: post.id }, data: { coverImage: cover } });
    repaired.push(post.slug);
    console.log("[Blog] Repaired missing cover for %s", post.slug);
  }
  return repaired;
}

/**
 * Publish a hand-written article that was queued for today.
 */
async function publishScheduledArticle() {
  const due = await prisma.blogPost.findFirst({
    where: { published: false, createdAt: { lte: new Date() } },
    orderBy: { createdAt: "asc" },
    select: { id: true, slug: true, title: true, category: true, coverImage: true },
  });
  if (!due) return null;

  let coverImage = due.coverImage;
  if (!coverImage) {
    coverImage = await generateCoverImage(due.title, due.category).catch(() => null);
  }

  await prisma.blogPost.update({
    where: { id: due.id },
    data: { published: true, ...(coverImage ? { coverImage } : {}) },
  });

  console.log("[Blog] Published queued article: %s", due.slug);
  return { slug: due.slug, title: due.title, coverImage: !!coverImage };
}

async function run(req: Request) {
  if (!(await canRunSeo(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const coversRepaired = await repairMissingCovers();

    const scheduled = await publishScheduledArticle();
    if (scheduled) {
      return NextResponse.json({
        success: true,
        source: "scheduled",
        slug: scheduled.slug,
        title: scheduled.title,
        coverImage: scheduled.coverImage,
        coversRepaired,
      });
    }

    const auto = await publishNextArticle();
    if (auto.published) {
      return NextResponse.json({
        success: true,
        source: "keyword-queue",
        keyword: auto.keyword,
        slug: auto.slug,
        title: auto.title,
        coversRepaired,
      });
    }

    if (auto.reason.startsWith("Keyword queue is empty")) {
      await harvestKeywords();
      const retry = await publishNextArticle();
      if (retry.published) {
        return NextResponse.json({
          success: true,
          source: "keyword-queue",
          keyword: retry.keyword,
          slug: retry.slug,
          title: retry.title,
          coversRepaired,
        });
      }
    }

    console.warn("[Blog] Autopilot did not publish (%s)", auto.reason);
    return NextResponse.json({ success: false, reason: auto.reason, coversRepaired });
  } catch (err: any) {
    console.error("[cron/generate-blog]", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

const __wrapped = wrapCron("generate-blog", run as any);
export const GET = __wrapped;
export const POST = __wrapped;
