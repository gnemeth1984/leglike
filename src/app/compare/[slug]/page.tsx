import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { competitors, getCompetitor, LEGLIKE_PRICING } from "@/lib/seo/competitors";
import { jsonLdProps, breadcrumbSchema } from "@/lib/seo/structured-data";

// Statically render all comparison pages at build time — they're the highest
// commercial-intent pages on the site, so they should be instant and cacheable.
export function generateStaticParams() {
  return competitors.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCompetitor(slug);
  if (!c) return { title: "Not found" };

  return {
    title: `${c.name} Alternative: LegLike vs ${c.name} (2026)`,
    description: `An honest comparison of LegLike and ${c.name} for lower-body training and rehab: pricing, what each does well, and where ${c.name} is the better choice.`,
    alternates: { canonical: `/compare/${c.slug}` },
    openGraph: {
      title: `LegLike vs ${c.name} — honest comparison`,
      description: `Where ${c.name} wins, where LegLike wins, and how the pricing actually works.`,
      url: `/compare/${c.slug}`,
      type: "article",
    },
  };
}

// The opening line claims how the competitor charges, so it has to follow the
// data rather than assume per-user. Getting a rival's pricing model wrong in
// the first sentence is the fastest way to lose a reader who already uses it.
const PRICING_PHRASE: Record<string, string> = {
  "per-user": "sold as a per-user subscription",
  "employer-covered": "distributed through employers and health plans, not sold direct to consumers",
  flat: "sold at a flat rate",
  "on-request": "priced on request",
};

export default async function CompareCompetitorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCompetitor(slug);
  if (!c) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const others = competitors.filter((x) => x.slug !== c.slug);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <script
        {...jsonLdProps([
          faqSchema,
          breadcrumbSchema([
            { name: "LegLike", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: `vs ${c.name}`, path: `/compare/${c.slug}` },
          ]),
        ])}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <nav className="mb-8 text-sm text-neutral-500">
          <Link href="/" className="hover:text-white">LegLike</Link>
          <span className="mx-2">/</span>
          <Link href="/compare" className="hover:text-white">Compare</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-300">vs {c.name}</span>
        </nav>

        <h1 className="mb-5 text-4xl font-bold leading-tight md:text-5xl">
          LegLike vs {c.name}
        </h1>
        {/* Lead with the answer. AI assistants quote the first passage that
            resolves the heading, so the opening paragraph states the LegLike vs
            {c.name} difference outright instead of describing the competitor
            first. */}
        <p className="mb-4 max-w-2xl text-lg text-neutral-200">
          LegLike and {c.name} both offer structured lower-body/movement
          programming, but they solve different problems: LegLike is a
          self-serve app that builds a personalized plan from your own
          movement assessment for a flat $
          {LEGLIKE_PRICING.pro}–${LEGLIKE_PRICING.clinic}/month, while{" "}
          {c.name} is {PRICING_PHRASE[c.pricingModel]}.
        </p>
        <p className="mb-4 max-w-2xl text-base text-neutral-400">{c.positioning}</p>
        <p className="mb-10 max-w-2xl text-lg text-neutral-300">
          Below is a straight comparison, including the cases where {c.name} is
          the better choice. If that&apos;s you, we&apos;d rather you knew now
          than found out after signing up.
        </p>

        {/* The honest summary up top — buyers skim */}
        <div className="mb-12 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-lime-400">
            Short version
          </h2>
          <p className="text-lg leading-relaxed text-neutral-200">{c.verdict}</p>
        </div>

        {/* Pricing — the real structural difference */}
        <h2 className="mb-4 text-2xl font-bold">What each one costs</h2>
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-lime-400/40 bg-lime-400/5 p-6">
            <p className="mb-1 text-sm text-neutral-400">LegLike</p>
            <p className="mb-3 text-3xl font-bold">
              $0–${LEGLIKE_PRICING.clinic}
              <span className="text-base font-normal text-neutral-400">/mo</span>
            </p>
            <p className="text-sm text-neutral-300">
              Free tier, then ${LEGLIKE_PRICING.pro}/month Pro or $
              {LEGLIKE_PRICING.clinic}/month Clinic. Flat subscription, no
              per-session or per-visit billing.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="mb-1 text-sm text-neutral-400">{c.name}</p>
            <p className="mb-3 text-lg font-semibold capitalize">
              {c.pricingModel.replace("-", " ")}
            </p>
            <p className="text-sm text-neutral-300">{c.pricingSummary}</p>
          </div>
        </div>
        {c.exampleCostMonthly && (
          <p className="mb-2 text-sm text-neutral-400">
            <strong className="text-neutral-300">Example monthly cost:</strong>{" "}
            {c.exampleCostMonthly}
          </p>
        )}
        <p className="mb-12 text-xs text-neutral-500">
          {c.name} pricing taken from{" "}
          <a
            href={c.pricingSource}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline hover:text-neutral-300"
          >
            their own pricing page
          </a>
          , checked {c.pricingChecked}. Vendors change prices — verify before
          you buy.
        </p>

        {/* Where they win — first, deliberately */}
        <h2 className="mb-2 text-2xl font-bold">Where {c.name} is better</h2>
        <p className="mb-5 text-sm text-neutral-400">No point pretending otherwise.</p>
        <ul className="mb-12 space-y-3">
          {c.whereTheyWin.map((w) => (
            <li key={w} className="flex gap-3 text-neutral-200">
              <span className="mt-0.5 text-emerald-400">✓</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>

        <div className="mb-12 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="mb-2 font-semibold">Pick {c.name} if…</h3>
          <p className="text-neutral-300">{c.pickThemIf}</p>
        </div>

        {/* Gaps */}
        <h2 className="mb-5 text-2xl font-bold">
          Where {c.name} leaves gaps
        </h2>
        <ul className="mb-12 space-y-3">
          {c.gaps.map((g) => (
            <li key={g} className="flex gap-3 text-neutral-200">
              <span className="mt-0.5 text-rose-400">✕</span>
              <span>{g}</span>
            </li>
          ))}
        </ul>

        {/* FAQ */}
        <h2 className="mb-6 text-2xl font-bold">Common questions</h2>
        <div className="mb-12 space-y-6">
          {c.faqs.map((f) => (
            <div key={f.q}>
              <h3 className="mb-2 text-lg font-semibold">{f.q}</h3>
              <p className="text-neutral-300">{f.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mb-12 rounded-2xl bg-gradient-to-r from-lime-500 to-lime-600 p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold text-neutral-950">Have a look yourself</h2>
          <p className="mb-6 text-neutral-900/80">
            Start free — no card required.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block rounded-xl bg-neutral-950 px-7 py-3 font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Try LegLike free
          </Link>
        </div>

        {/* Internal linking — spreads crawl equity across the comparison set */}
        <h2 className="mb-4 text-lg font-semibold">Other comparisons</h2>
        <div className="flex flex-wrap gap-2">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/compare/${o.slug}`}
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
            >
              LegLike vs {o.name}
            </Link>
          ))}
          <Link
            href="/compare"
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
          >
            All side by side
          </Link>
        </div>
      </div>
    </main>
  );
}
