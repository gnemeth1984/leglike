/**
 * lib/seo/exercisePages.ts — one SEO page per exercise in the library.
 *
 * Unlike the blog (keyword-harvest-driven), this is data-driven: the 60+ rows
 * in `Exercise` already exist, so the job is simply "write the long-form
 * how-to guide for the next one that doesn't have one yet". No keyword queue,
 * no harvest loop — just walk the table.
 *
 * Reuses the same guardrails as the blog autopilot: PRODUCT_FACTS injected
 * into the prompt, checkLegLikeFacts on the way out, a branded/AI cover image,
 * and an IndexNow ping on publish.
 */

import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { generateCoverImage } from "@/lib/blog/cover-image";
import { submitToIndexNow } from "@/lib/seo/indexnow";
import { PRODUCT_FACTS, checkLegLikeFacts, stripPlaceholderLinks } from "@/lib/seo/product-facts";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SITE = "https://leglike.com";

async function log(ok: boolean, detail: string) {
  await prisma.seoRun
    .create({ data: { task: "exercise-page", ok, detail: detail.slice(0, 4000) } })
    .catch((e: unknown) => console.error("[seo] run log failed", e));
}

type Written = {
  title: string;
  metaTitle: string;
  metaDesc: string;
  content: string;
  faq: { q: string; a: string }[];
};

async function writeExercisePage(ex: {
  name: string;
  description: string;
  instructions: string;
  type: string;
  region: string;
  difficulty: string;
  equipment: string[];
  sets: number | null;
  reps: string | null;
  durationSec: number | null;
}): Promise<Written | null> {
  const prompt = `You are writing an exercise guide page for LegLike, an AI-guided lower-body training/rehab app.

${PRODUCT_FACTS}

Write the definitive "how to do it" guide for this exercise:
- Name: ${ex.name}
- Card description: ${ex.description}
- Basic instructions: ${ex.instructions}
- Category: ${ex.type} | Body region: ${ex.region} | Difficulty: ${ex.difficulty}
- Equipment: ${ex.equipment.length ? ex.equipment.join(", ") : "bodyweight"}
${ex.sets ? `- Typical sets: ${ex.sets}` : ""}${ex.reps ? ` reps: ${ex.reps}` : ""}${ex.durationSec ? ` duration: ${ex.durationSec}s` : ""}

Hard rules:
- 800-1100 words. No padding — every sentence earns its place.
- Open with a 2-3 sentence bold paragraph giving the direct answer to "how do I do a ${ex.name}", before any heading.
- Sections (as "## " H2s): how to do it (numbered steps), muscles worked, common mistakes (name the mistake AND the fix), a beginner/intermediate/advanced variation or progression, and when to avoid it / see a clinician instead if it's a rehab-type movement.
- Include the sets/reps/tempo guidance a beginner could follow today.
- Never claim LegLike diagnoses anything or replaces a physical therapist.
- Mention LegLike once, in passing, as the app this exercise's programming can live in.
- Clean Markdown only, no HTML, no H1 in the body.
- Every link must be a real absolute URL or a real /exercises/... or /blog/... path — never a placeholder like [link](#).
- "faq" is required: 3-4 real questions with 2-3 sentence answers.

Return ONLY JSON, no code fences:
{
 "title": "How to Do a ${ex.name}: Form, Sets & Common Mistakes (or similar natural title)",
 "metaTitle": "under 60 chars, ends with | LegLike",
 "metaDesc": "under 155 chars",
 "content": "the full markdown guide",
 "faq": [{"q":"...","a":"..."}]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4000,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content || "";
  try {
    const a = JSON.parse(raw) as Written;
    if (!a.title || !a.content) return null;
    a.faq = Array.isArray(a.faq) ? a.faq.filter((f) => f?.q && f?.a).slice(0, 6) : [];
    a.content = stripPlaceholderLinks(a.content);

    const faqText = a.faq.map((f) => `${f.q}\n${f.a}`).join("\n\n");
    const problems = checkLegLikeFacts(`${a.content}\n\n${faqText}`);
    if (problems.length) {
      console.error(`[seo] REFUSING exercise page "${ex.name}" — invented facts:\n  ${problems.join("\n  ")}`);
      return null;
    }
    return a;
  } catch (err) {
    console.error("[seo] exercise page JSON parse failed", err, raw.slice(0, 300));
    return null;
  }
}

/** Weave in 2 links to other published exercises in the same region. */
function insertRelatedLinks(content: string, related: { slug: string; name: string }[]): string {
  if (related.length === 0) return content;
  const paragraphs = content.split("\n\n");
  const bodyIdxs = paragraphs
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.trim() && !p.trim().startsWith("#"))
    .map(({ i }) => i);

  related.slice(0, 2).forEach((r, i) => {
    const idx = bodyIdxs[Math.floor(((i + 1) / 3) * bodyIdxs.length)];
    if (idx === undefined) return;
    paragraphs[idx] = `${paragraphs[idx]}\n\n*Related: [${r.name}](/exercises/${r.slug})*`;
  });

  paragraphs.push(
    `Want this exercise programmed into a full plan for you? [Try LegLike](/) — AI-guided lower-body workouts, mobility assessment and rehab plans.`,
  );
  return paragraphs.join("\n\n");
}

/**
 * Write the SEO page for the next exercise that doesn't have one yet, up to
 * `limit` in one run (a cron call, not a per-request loop).
 */
export async function generateNextExercisePages(limit = 2): Promise<{
  written: { slug: string; name: string }[];
  reason?: string;
}> {
  const pending = await prisma.exercise.findMany({
    where: { published: false },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  if (pending.length === 0) {
    await log(false, "no exercises pending a page");
    return { written: [], reason: "Every exercise already has a page." };
  }

  const written: { slug: string; name: string }[] = [];

  for (const ex of pending) {
    const article = await writeExercisePage(ex);
    if (!article) {
      await log(false, `generation failed for "${ex.name}"`);
      continue;
    }

    const related = await prisma.exercise.findMany({
      where: { published: true, region: ex.region, id: { not: ex.id } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { slug: true, name: true },
    });

    const content = insertRelatedLinks(article.content, related);
    const coverImage = await generateCoverImage(article.title, "training").catch(() => null);

    await prisma.exercise.update({
      where: { id: ex.id },
      data: {
        content,
        metaTitle: article.metaTitle.slice(0, 70),
        metaDesc: article.metaDesc.slice(0, 165),
        faq: article.faq.length ? JSON.stringify(article.faq) : undefined,
        keyword: `how to do a ${ex.name.toLowerCase()}`,
        wordCount: content.split(/\s+/).length,
        coverImage: coverImage ?? undefined,
        published: true,
      },
    });

    await submitToIndexNow([`${SITE}/exercises/${ex.slug}`, `${SITE}/exercises`]);
    await log(true, `/exercises/${ex.slug}`);
    written.push({ slug: ex.slug, name: ex.name });
  }

  if (written.length === 0) {
    return { written, reason: "Generation failed for every exercise in this batch." };
  }
  return { written };
}

/** Thicken the thinnest published exercise page, same idea as the blog refresh loop. */
export async function refreshThinnestExercisePage(): Promise<
  { refreshed: true; slug: string } | { refreshed: false; reason: string }
> {
  const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 3600 * 1000);
  const thin = await prisma.exercise.findFirst({
    where: {
      published: true,
      AND: [
        { OR: [{ wordCount: { lt: 700 } }, { wordCount: null }] },
        { OR: [{ refreshedAt: null }, { refreshedAt: { lt: threeWeeksAgo } }] },
      ],
    },
    orderBy: [{ wordCount: "asc" }, { createdAt: "asc" }],
  });
  if (!thin) return { refreshed: false, reason: "Nothing thin enough to refresh right now." };

  const rewritten = await writeExercisePage(thin);
  if (!rewritten) return { refreshed: false, reason: `Rewrite failed for "${thin.name}".` };

  const content = stripPlaceholderLinks(rewritten.content);
  await prisma.exercise.update({
    where: { id: thin.id },
    data: {
      content,
      metaTitle: rewritten.metaTitle.slice(0, 70),
      metaDesc: rewritten.metaDesc.slice(0, 165),
      faq: rewritten.faq.length ? JSON.stringify(rewritten.faq) : undefined,
      wordCount: content.split(/\s+/).length,
      refreshedAt: new Date(),
      refreshCount: { increment: 1 },
    },
  });
  await submitToIndexNow([`${SITE}/exercises/${thin.slug}`]);
  await log(true, `refreshed /exercises/${thin.slug}`);
  return { refreshed: true, slug: thin.slug };
}
