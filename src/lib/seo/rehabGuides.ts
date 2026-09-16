/**
 * lib/seo/rehabGuides.ts — one SEO guide per common lower-body injury/condition.
 *
 * Public path: /rehab-guides/[slug] (deliberately NOT /rehab, which is the
 * protected per-user RehabPlan feature — this is unauthenticated SEO content).
 *
 * Like exercisePages.ts, this is data-driven rather than keyword-harvest-driven:
 * we walk a fixed condition list (below) and write the guide for whichever
 * condition doesn't have a RehabGuide row yet. Same guardrails as the blog:
 * PRODUCT_FACTS injected, checkLegLikeFacts on the way out, cover image,
 * IndexNow ping on publish.
 */

import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { generateCoverImage, slugify } from "@/lib/blog/cover-image";
import { submitToIndexNow } from "@/lib/seo/indexnow";
import { PRODUCT_FACTS, checkLegLikeFacts, stripPlaceholderLinks } from "@/lib/seo/product-facts";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SITE = "https://leglike.com";

/**
 * Fixed condition list, one per row, each tagged with the BodyRegion it maps
 * to. Not exhaustive of all lower-body medicine — scoped to what a lower-body
 * training/rehab app's audience actually searches for. Extend this array to
 * add more guides later; the generator just walks whatever isn't in the DB yet.
 */
export const REHAB_CONDITIONS: { condition: string; region: "HIP" | "KNEE" | "ANKLE" | "FOOT" | "GLUTE" | "HAMSTRING" | "QUAD" | "CALF" | "FULL_LEG" }[] = [
  { condition: "Runner's knee (patellofemoral pain syndrome)", region: "KNEE" },
  { condition: "ACL tear / ACL reconstruction recovery", region: "KNEE" },
  { condition: "Meniscus tear", region: "KNEE" },
  { condition: "Patellar tendinitis (jumper's knee)", region: "KNEE" },
  { condition: "IT band syndrome", region: "KNEE" },
  { condition: "Plantar fasciitis", region: "FOOT" },
  { condition: "Achilles tendinitis", region: "CALF" },
  { condition: "Achilles tendon rupture recovery", region: "CALF" },
  { condition: "Calf strain", region: "CALF" },
  { condition: "Ankle sprain (lateral ankle sprain)", region: "ANKLE" },
  { condition: "Chronic ankle instability", region: "ANKLE" },
  { condition: "Shin splints (medial tibial stress syndrome)", region: "CALF" },
  { condition: "Hip flexor strain", region: "HIP" },
  { condition: "Hip impingement (FAI)", region: "HIP" },
  { condition: "Piriformis syndrome", region: "GLUTE" },
  { condition: "Gluteal tendinopathy", region: "GLUTE" },
  { condition: "Hamstring strain", region: "HAMSTRING" },
  { condition: "Proximal hamstring tendinopathy", region: "HAMSTRING" },
  { condition: "Quad strain", region: "QUAD" },
  { condition: "Patellar dislocation recovery", region: "KNEE" },
  { condition: "Sciatica (leg-referred lower back pain)", region: "FULL_LEG" },
  { condition: "Post-surgery leg deconditioning / return to activity", region: "FULL_LEG" },
];

async function log(ok: boolean, detail: string) {
  await prisma.seoRun
    .create({ data: { task: "rehab-guide", ok, detail: detail.slice(0, 4000) } })
    .catch((e: unknown) => console.error("[seo] run log failed", e));
}

type Written = {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDesc: string;
  content: string;
  faq: { q: string; a: string }[];
};

async function writeRehabGuide(condition: string, region: string): Promise<Written | null> {
  const prompt = `You are writing a rehab/recovery guide page for LegLike, an AI-guided lower-body training/rehab app.

${PRODUCT_FACTS}

Write a grounded, safety-first recovery guide for this condition:
- Condition: ${condition}
- Body region: ${region}

Hard rules:
- 900-1300 words. No padding.
- Open with a bold 2-3 sentence paragraph directly answering "what is ${condition} and how do I recover from it", before any heading.
- Sections (as "## " H2s): what it is / common symptoms, what usually causes it, recovery timeline (rough phases, not medical promises), safe exercises/movements during recovery, what to avoid, and a clear "when to see a doctor or physical therapist" section.
- Be explicit and repeated that this is general information, not a diagnosis, and a clinician should confirm anything serious, persistent, or worsening.
- Mention LegLike once, in passing, as a place this kind of guided, progressive programming can live — never claim it diagnoses or replaces a clinician.
- Clean Markdown only, no HTML, no H1 in the body.
- Every link must be a real absolute URL or a real /exercises/... or /blog/... path — never a placeholder like [link](#).
- "faq" is required: 3-4 real questions with 2-3 sentence answers.

Return ONLY JSON, no code fences:
{
 "title": "natural title, e.g. '${condition}: Causes, Recovery Timeline & Safe Exercises'",
 "excerpt": "one sentence, under 160 chars, for a card preview",
 "metaTitle": "under 60 chars, ends with | LegLike",
 "metaDesc": "under 155 chars",
 "content": "the full markdown guide",
 "faq": [{"q":"...","a":"..."}]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4200,
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
      console.error(`[seo] REFUSING rehab guide "${condition}" — invented facts:\n  ${problems.join("\n  ")}`);
      return null;
    }
    return a;
  } catch (err) {
    console.error("[seo] rehab guide JSON parse failed", err, raw.slice(0, 300));
    return null;
  }
}

/** Weave in links to up to 2 other published guides in the same region + a related exercise. */
function insertRelatedLinks(
  content: string,
  relatedGuides: { slug: string; title: string }[],
  relatedExercises: { slug: string; name: string }[],
): string {
  const paragraphs = content.split("\n\n");
  const bodyIdxs = paragraphs
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.trim() && !p.trim().startsWith("#"))
    .map(({ i }) => i);

  relatedGuides.slice(0, 2).forEach((r, i) => {
    const idx = bodyIdxs[Math.floor(((i + 1) / 4) * bodyIdxs.length)];
    if (idx === undefined) return;
    paragraphs[idx] = `${paragraphs[idx]}\n\n*Related: [${r.title}](/rehab-guides/${r.slug})*`;
  });

  relatedExercises.slice(0, 1).forEach((r) => {
    paragraphs.push(`*See the full how-to: [${r.name}](/exercises/${r.slug})*`);
  });

  paragraphs.push(
    `Want a recovery plan that adapts to how you're actually progressing? [Try LegLike](/) — AI-guided lower-body training, mobility assessment and rehab plans.`,
  );
  return paragraphs.join("\n\n");
}

/**
 * Write the guide for the next condition that doesn't have a RehabGuide row
 * yet, up to `limit` in one run.
 */
export async function generateNextRehabGuides(limit = 2): Promise<{
  written: { slug: string; condition: string }[];
  reason?: string;
}> {
  const existing = await prisma.rehabGuide.findMany({ select: { condition: true } });
  const done = new Set(existing.map((e) => e.condition));
  const pending = REHAB_CONDITIONS.filter((c) => !done.has(c.condition)).slice(0, limit);

  if (pending.length === 0) {
    await log(false, "no conditions pending a guide");
    return { written: [], reason: "Every condition in the list already has a guide." };
  }

  const written: { slug: string; condition: string }[] = [];

  for (const { condition, region } of pending) {
    const article = await writeRehabGuide(condition, region);
    if (!article) {
      await log(false, `generation failed for "${condition}"`);
      continue;
    }

    const slug = slugify(article.title);
    const already = await prisma.rehabGuide.findUnique({ where: { slug } });
    if (already) {
      await log(false, `slug collision for "${condition}" (${slug}), skipping this run`);
      continue;
    }

    const relatedGuides = await prisma.rehabGuide.findMany({
      where: { published: true, region },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { slug: true, title: true },
    });
    const relatedExercises = await prisma.exercise.findMany({
      where: { published: true, region },
      orderBy: { createdAt: "desc" },
      take: 2,
      select: { slug: true, name: true },
    });

    const content = insertRelatedLinks(article.content, relatedGuides, relatedExercises);
    const coverImage = await generateCoverImage(article.title, "rehab").catch(() => null);

    await prisma.rehabGuide.create({
      data: {
        slug,
        title: article.title,
        excerpt: article.excerpt.slice(0, 200),
        content,
        condition,
        region,
        metaTitle: article.metaTitle.slice(0, 70),
        metaDesc: article.metaDesc.slice(0, 165),
        faq: article.faq.length ? JSON.stringify(article.faq) : undefined,
        keyword: condition.toLowerCase(),
        wordCount: content.split(/\s+/).length,
        coverImage: coverImage ?? undefined,
        published: true,
      },
    });

    await submitToIndexNow([`${SITE}/rehab-guides/${slug}`, `${SITE}/rehab-guides`]);
    await log(true, `/rehab-guides/${slug}`);
    written.push({ slug, condition });
  }

  if (written.length === 0) {
    return { written, reason: "Generation failed for every condition in this batch." };
  }
  return { written };
}

/** Thicken the thinnest published rehab guide, same idea as the blog refresh loop. */
export async function refreshThinnestRehabGuide(): Promise<
  { refreshed: true; slug: string } | { refreshed: false; reason: string }
> {
  const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 3600 * 1000);
  const thin = await prisma.rehabGuide.findFirst({
    where: {
      published: true,
      AND: [
        { OR: [{ wordCount: { lt: 800 } }, { wordCount: null }] },
        { OR: [{ refreshedAt: null }, { refreshedAt: { lt: threeWeeksAgo } }] },
      ],
    },
    orderBy: [{ wordCount: "asc" }, { createdAt: "asc" }],
  });
  if (!thin) return { refreshed: false, reason: "Nothing thin enough to refresh right now." };

  const rewritten = await writeRehabGuide(thin.condition, thin.region);
  if (!rewritten) return { refreshed: false, reason: `Rewrite failed for "${thin.condition}".` };

  const content = stripPlaceholderLinks(rewritten.content);
  await prisma.rehabGuide.update({
    where: { id: thin.id },
    data: {
      content,
      excerpt: rewritten.excerpt.slice(0, 200),
      metaTitle: rewritten.metaTitle.slice(0, 70),
      metaDesc: rewritten.metaDesc.slice(0, 165),
      faq: rewritten.faq.length ? JSON.stringify(rewritten.faq) : undefined,
      wordCount: content.split(/\s+/).length,
      refreshedAt: new Date(),
      refreshCount: { increment: 1 },
    },
  });
  await submitToIndexNow([`${SITE}/rehab-guides/${thin.slug}`]);
  await log(true, `refreshed /rehab-guides/${thin.slug}`);
  return { refreshed: true, slug: thin.slug };
}
