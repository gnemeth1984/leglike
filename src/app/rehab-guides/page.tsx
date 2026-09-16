import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { jsonLdProps, breadcrumbSchema, SITE_URL } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Rehab Guides | LegLike",
  description:
    "Recovery guides for common lower-body injuries — causes, timelines, safe exercises, and when to see a clinician.",
  alternates: { canonical: "/rehab-guides" },
};

export const revalidate = 3600;

const REGION_COLORS: Record<string, string> = {
  HIP: "bg-purple-400/10 text-purple-400",
  KNEE: "bg-blue-400/10 text-blue-400",
  ANKLE: "bg-teal-400/10 text-teal-400",
  FOOT: "bg-orange-400/10 text-orange-400",
  GLUTE: "bg-pink-400/10 text-pink-400",
  HAMSTRING: "bg-red-400/10 text-red-400",
  QUAD: "bg-yellow-400/10 text-yellow-400",
  CALF: "bg-lime-400/10 text-lime-400",
  FULL_LEG: "bg-neutral-400/10 text-neutral-300",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export default async function RehabGuidesPage() {
  const guides = await prisma.rehabGuide
    .findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { slug: true, title: true, excerpt: true, region: true, createdAt: true, coverImage: true },
    })
    .catch(() => []);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: guides.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/rehab-guides/${g.slug}`,
      name: g.title,
    })),
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <script
        {...jsonLdProps([
          itemListSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Rehab Guides", path: "/rehab-guides" },
          ]),
        ])}
      />
      <div className="border-b border-neutral-800/60">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lime-400 font-bold text-xl mb-8 hover:text-lime-300"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 text-neutral-950">
              L
            </span>
            LegLike
          </Link>
          <h1 className="text-4xl font-bold text-white mt-4 mb-3">Rehab Guides</h1>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            Causes, recovery timelines and safe exercises for common lower-body injuries — written
            to help you understand what&apos;s going on, not to replace a clinician.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {guides.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-xl">Guides coming soon — check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/rehab-guides/${g.slug}`}
                className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden hover:border-lime-400/50 hover:shadow-lg hover:shadow-lime-400/5 transition-all group"
              >
                {g.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.coverImage} alt={g.title} loading="lazy" className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-neutral-800 to-neutral-900" />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        REGION_COLORS[g.region] || "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {g.region.replace("_", " ")}
                    </span>
                  </div>
                  <h2 className="font-semibold text-white group-hover:text-lime-400 transition-colors mb-2 leading-snug">
                    {g.title}
                  </h2>
                  <p className="text-sm text-neutral-400 line-clamp-3 mb-4">{g.excerpt}</p>
                  <p className="text-xs text-neutral-500">{formatDate(g.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 bg-lime-400 rounded-2xl p-8 text-center text-neutral-950">
          <h3 className="text-2xl font-bold mb-2">Build your recovery plan with LegLike</h3>
          <p className="text-neutral-800 mb-6">
            AI-guided lower-body rehab plans that adapt as you progress. Free to start.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-neutral-950 text-white font-semibold px-8 py-3 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </main>
    </div>
  );
}
