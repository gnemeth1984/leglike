import { Metadata } from "next";
import { articleSchema, breadcrumbSchema, faqSchema, jsonLdProps } from "@/lib/seo/structured-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import ShareButtons from "@/components/blog/ShareButtons";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const exercises = await prisma.exercise
    .findMany({ where: { published: true }, select: { slug: true } })
    .catch(() => []);
  return exercises.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ex = await prisma.exercise
    .findUnique({
      where: { slug },
      select: { published: true, metaTitle: true, metaDesc: true, name: true, coverImage: true },
    })
    .catch(() => null);
  if (!ex || !ex.published) return { title: "Not Found" };

  const cover = ex.coverImage
    ? ex.coverImage.startsWith("http")
      ? ex.coverImage
      : `https://leglike.com${ex.coverImage.startsWith("/") ? "" : "/"}${ex.coverImage}`
    : null;

  return {
    title: ex.metaTitle || `How to Do a ${ex.name} | LegLike`,
    description: ex.metaDesc || undefined,
    alternates: { canonical: `/exercises/${slug}` },
    openGraph: {
      type: "article",
      title: ex.metaTitle || ex.name,
      description: ex.metaDesc || "",
      url: `/exercises/${slug}`,
      ...(cover ? { images: [{ url: cover, width: 1200, height: 630, alt: ex.name }] } : {}),
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title: ex.metaTitle || ex.name,
      description: ex.metaDesc || "",
      ...(cover ? { images: [cover] } : {}),
    },
  };
}

const TYPE_LABELS: Record<string, string> = {
  STRENGTH: "Strength",
  MOBILITY: "Mobility",
  REHAB: "Rehab",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default async function ExercisePage({ params }: Props) {
  const { slug } = await params;
  const ex = await prisma.exercise.findUnique({ where: { slug } });
  if (!ex || !ex.published || !ex.content) notFound();

  let faq: { q: string; a: string }[] = [];
  if (ex.faq) {
    try {
      const parsed = JSON.parse(ex.faq);
      if (Array.isArray(parsed)) faq = parsed.filter((f) => f?.q && f?.a).slice(0, 8);
    } catch {
      faq = [];
    }
  }

  const related = await prisma.exercise.findMany({
    where: { published: true, region: ex.region, slug: { not: ex.slug } },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { slug: true, name: true, description: true },
  });

  return (
    <div className="min-h-screen bg-neutral-950">
      <script
        {...jsonLdProps([
          articleSchema({
            title: ex.name,
            description: ex.metaDesc || ex.description,
            slug: ex.slug,
            basePath: "exercises",
            published: ex.createdAt,
            updated: ex.refreshedAt || ex.createdAt,
          }),
          breadcrumbSchema([
            { name: "LegLike", path: "/" },
            { name: "Exercises", path: "/exercises" },
            { name: ex.name, path: `/exercises/${ex.slug}` },
          ]),
          ...(faq.length ? [faqSchema(faq)] : []),
        ])}
      />
      <div className="border-b border-neutral-800/60 sticky top-0 bg-neutral-950/95 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-lime-400 font-bold hover:text-lime-300">
            LegLike
          </Link>
          <Link href="/exercises" className="text-sm text-neutral-400 hover:text-white">
            ← All Exercises
          </Link>
        </div>
      </div>

      <main>
        <article className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs font-medium bg-lime-400/10 text-lime-400 px-2 py-1 rounded-full">
                {TYPE_LABELS[ex.type] || ex.type}
              </span>
              <span className="text-xs font-medium bg-neutral-800 text-neutral-300 px-2 py-1 rounded-full">
                {ex.region.replace("_", " ")}
              </span>
              <span className="text-xs font-medium bg-neutral-800 text-neutral-300 px-2 py-1 rounded-full">
                {DIFFICULTY_LABELS[ex.difficulty] || ex.difficulty}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight mb-4">
              How to Do a {ex.name}
            </h1>
            <p className="text-lg text-neutral-400 leading-relaxed">{ex.description}</p>
          </div>

          {ex.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ex.coverImage}
              alt={ex.name}
              className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-8"
            />
          )}

          <ShareButtons title={`How to Do a ${ex.name}`} slug={ex.slug} basePath="/exercises" />

          <hr className="border-neutral-800 my-8" />

          <div className="prose prose-invert prose-neutral prose-headings:text-white prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-3 prose-p:text-neutral-300 prose-p:leading-relaxed prose-li:text-neutral-300 prose-strong:text-white prose-a:text-lime-400 max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h2 className="text-2xl font-bold text-white mt-8 mb-3">{children}</h2>
                ),
              }}
            >
              {ex.content}
            </ReactMarkdown>
          </div>

          {faq.length > 0 && (
            <section className="mt-12">
              <h2 className="font-bold text-white text-xl mb-4">Frequently asked questions</h2>
              <div className="divide-y divide-neutral-800 border-t border-neutral-800">
                {faq.map((f, i) => (
                  <details key={i} className="group py-4" open={i === 0}>
                    <summary className="cursor-pointer list-none font-semibold text-white text-[15px] flex items-start justify-between gap-3">
                      <span>{f.q}</span>
                      <span className="text-neutral-500 group-open:rotate-45 transition-transform text-lg leading-none">
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-neutral-400 text-sm leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <div className="mt-12 bg-lime-400/5 border border-lime-400/20 rounded-2xl p-6">
            <h3 className="font-bold text-white text-lg mb-1">Program this exercise into a full plan</h3>
            <p className="text-neutral-400 text-sm mb-4">
              Personalized lower-body strength, mobility and rehab plans, powered by AI. Free to start.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block bg-lime-400 text-neutral-950 font-semibold px-6 py-2.5 rounded-xl hover:bg-lime-300 transition-colors text-sm"
            >
              Get Started Free
            </Link>
          </div>
        </article>
      </main>

      {related.length > 0 && (
        <div className="border-t border-neutral-800/60 bg-neutral-900/40 py-12">
          <div className="max-w-3xl mx-auto px-6">
            <h3 className="font-bold text-white text-lg mb-6">Related exercises</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/exercises/${r.slug}`}
                  className="block rounded-xl border border-neutral-800 p-4 hover:border-lime-400/50 transition-colors"
                >
                  <h4 className="font-semibold text-white text-sm mb-1 leading-snug">{r.name}</h4>
                  <p className="text-xs text-neutral-400 line-clamp-2">{r.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
