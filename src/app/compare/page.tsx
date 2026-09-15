import Link from "next/link";
import { competitors, LEGLIKE_PRICING } from "@/lib/seo/competitors";
import { jsonLdProps, breadcrumbSchema } from "@/lib/seo/structured-data";

export const metadata = {
  title: "LegLike vs Hinge Health, Kemtai, Fitbod & More",
  description:
    "How LegLike compares to Hinge Health, Curovate, Kemtai, Pliability, Fitbod and Caliber for lower-body training and rehab. Includes where each alternative is the better choice.",
  alternates: { canonical: "/compare" },
};

const pricingLabel: Record<string, string> = {
  "per-user": "Per-user subscription",
  "employer-covered": "Employer/insurer-covered",
  flat: "Flat monthly",
  "on-request": "Priced on request",
};

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-16">
      <script
        {...jsonLdProps(
          breadcrumbSchema([
            { name: "LegLike", path: "/" },
            { name: "Compare", path: "/compare" },
          ])
        )}
      />
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-lime-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-lime-400">
            Comparisons
          </span>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">LegLike vs the rest</h1>
          <p className="mx-auto max-w-2xl text-lg text-neutral-400">
            An AI-generated lower-body training and rehab plan, built from a real
            movement assessment, at $0/$9/$16 a month. Including, honestly, where
            each alternative below is the better choice for you.
          </p>
        </div>

        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          {competitors.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-lime-400/40"
            >
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                {pricingLabel[c.pricingModel]}
              </div>
              <h2 className="mb-2 text-xl font-bold text-white">LegLike vs {c.name}</h2>
              <p className="text-sm text-neutral-400">{c.short}</p>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
          <p className="text-sm text-neutral-400">
            LegLike is $0 / ${LEGLIKE_PRICING.pro} / ${LEGLIKE_PRICING.clinic} a month —
            flat subscription pricing, not per-session or per-visit billing.
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/auth/signup"
            className="rounded-xl bg-lime-400 px-8 py-3 text-base font-semibold text-neutral-950 transition-colors hover:bg-lime-300"
          >
            Try LegLike free →
          </Link>
        </div>
      </div>
    </main>
  );
}
