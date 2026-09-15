/**
 * lib/seo/product-facts.ts — the single source of truth about LegLike for
 * every AI writing prompt.
 *
 * A model asked to compare pricing or features will always produce an answer.
 * If we don't supply the real one it produces a plausible one, and that
 * number then gets indexed, quoted by AI assistants, and read by people
 * deciding whether to buy. So: facts injected into the prompt, and a hard
 * check on the way out (same pattern Rotahr uses for its own product).
 */

/** Live plan pricing. Update here and every prompt follows. */
export const PLANS = [
  { name: "Free", price: 0, detail: "1 mobility assessment/month, library access, 1 AI workout plan/month" },
  { name: "Pro", price: 9, detail: "unlimited AI workout plans, rehab plans, assessments, progress tracking, priority support" },
  { name: "Clinic", price: 16, detail: "everything in Pro, multi-client management, clinician dashboard, custom protocols, dedicated onboarding" },
] as const;

/**
 * The facts block. Deliberately includes what LegLike is NOT, because honest
 * "when not to pick us" sections are what make a comparison page trustworthy
 * — and left unguided the model invents those weaknesses too.
 */
export const PRODUCT_FACTS = `FACTS ABOUT LEGLIKE — these are authoritative. Never state a price, plan or limit that contradicts them, and never invent one that isn't here.

Pricing (monthly subscription, USD):
${PLANS.map((p) => `- ${p.name}: $${p.price}/month — ${p.detail}`).join("\n")}
- CRITICAL: LegLike's real prices are $0 (Free), $9/month (Pro) and $16/month
  (Clinic). If you write any other number for LegLike's plans, you have made a
  factual error.

What LegLike actually includes (do not credit it with anything else):
- AI workout generator (GPT-4o-mini) that builds personalized lower-body
  strength programs
- Mobility assessment: a hip, knee, ankle and balance screen that scores
  movement quality and gives a recommendation
- Rehab plans: phased recovery programs for injury, with progress through
  phases
- Exercise library: 50+ movements covering strength, mobility, rehab, balance
  and stretching, filterable by body region and equipment
- Progress tracking across workouts, assessments and rehab plans
- Equipment-adaptive programming: home, gym or clinic equipment
- Clinic plan: multi-client management and a clinician dashboard for
  physios/trainers managing several people's programs

Honest limitations — use these when a section calls for balance, rather than
inventing weaknesses:
- LegLike is lower-body focused (hip, knee, ankle, glute, hamstring, quad,
  calf) — it is not a full-body bodybuilding program or a general fitness
  tracker.
- AI-generated programming is not a substitute for in-person diagnosis of a
  serious or unclear injury; LegLike itself recommends seeing a clinician for
  anything that isn't responding to a self-guided plan.
- It is a young product from a small team, not an enterprise clinical
  platform with insurance billing or EHR integration.
- The free tier is capped at 1 assessment and 1 AI plan a month — regular use
  needs Pro.`;

/**
 * Anything that claims a LegLike price other than $0 / $9 / $16.
 * Returns a list of problems, empty when clean.
 */
export function checkLegLikeFacts(markdown: string): string[] {
  const problems: string[] = [];
  const valid = new Set(PLANS.map((p) => String(p.price)));

  // Table rows: "| LegLike | $19 | ... |" slips past a prose-only regex.
  for (const row of markdown.split("\n")) {
    if (!/^\s*\|/.test(row) || !/leglike/i.test(row)) continue;
    for (const m of row.matchAll(/\$\s?(\d[\d.,]*)/g)) {
      const num = m[1].replace(/[.,]$/, "");
      if (valid.has(num)) continue;
      if (Number(num.replace(/[,.]/g, "")) >= 1000) continue;
      problems.push(`price in a LegLike table row that is not a real plan price: "${row.trim().slice(0, 120)}"`);
      break;
    }
  }

  // A price sitting next to "LegLike" in prose that is not $0/$9/$16.
  const CONTRAST = /\b(compared to|versus|vs\.?|unlike|whereas|rather than|instead of|while|but)\b/i;
  const near = /LegLike[^.\n|]{0,120}?(\$)\s?(\d[\d.,]*)/gi;
  for (const m of markdown.matchAll(near)) {
    const num = m[2].replace(/[.,]$/, "");
    const asInt = Number(num.replace(/[,.]/g, ""));
    if (valid.has(num)) continue;
    if (asInt >= 1000) continue;
    if (CONTRAST.test(markdown.slice(Math.max(0, m.index! - 40), m.index!))) continue;
    problems.push(`price near LegLike that is not a real plan price: "${m[0].replace(/\s+/g, " ").slice(0, 120)}"`);
  }

  return problems;
}

/** Strip placeholder links the model leaves behind, e.g. [Read more](#). */
export function stripPlaceholderLinks(markdown: string): string {
  return markdown
    .replace(/^\s*\*Related:[^\n]*\]\(#\)[^\n]*\*\s*$/gm, "")
    .replace(/\[([^\]]+)\]\(#\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n");
}
