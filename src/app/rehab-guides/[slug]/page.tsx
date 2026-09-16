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
  const guides = await prisma.rehabGuide
    .findMany({ where: { published: true }, select: { slug: true } })
    .catch(() => []);
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await prisma.rehabGuide
    .findUnique({
      where: { slug, published: true },
      select: { metaTitle: true, metaDesc: true, title: true, coverImage: true },
    })
    .catch(() => null);
  if (!guide) return { title: "Not Found" };

  const cover = guide.coverImage
    ? guide.coverImage.startsWith("http")
      ? guide.coverImage
      : `https://leglike.com${guide.coverImage.startsWith("/") ? "" : "/"}${guide.coverImage}`
    : null;

  return {
    title: guide.metaTitle || guide.title,
    description: guide.metaDesc,
    alternates: { canonical: `/rehab-guides/${slug}` },
    openGraph: {
      type: "article",
      title: guide.metaTitle || guide.title,
      description: guide.metaDesc || "",
      url: `/rehab-guides/${slug}`,
      ...(cover ? { images: [{ url: cover, width: 1200, height: 630, alt: guide.title }] } : {}),
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title: guide.metaTitle || guide.title,
      description: guide.metaDesc || "",
      ...(cover ? { images: [cover] } : {}),
    },
  };
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export default async function RehabGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await prisma.rehabGuide.findUnique({ where: { slug, published: true } });
  if (!guide) notFound();

  let faq: { q: string; a: string }[] = [];
  if (guide.faq) {
    try {
      const parsed = JSON.parse(guide.faq);
      if (Array.isArray(parsed)) faq = parsed.filter((f) => f?.q && f?.a).slice(0, 8);
    } catch {
      faq = [];
    }
  }

  const related = await prisma.rehabGuide.findMany({
    where: { published: true, region: guide.region, slug: { not: guide.slug } },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { slug: true, title: true, excerpt: true },
  });

  return (
    <div className="min-h-screen bg-neutral-950">
      <script
        {...jsonLdProps([
          articleSchema({
            title: guide.title,
            description: guide.metaDesc || guide.excerpt,
            slug: guide.slug,
            basePath: "rehab-guides",
            published: guide.createdAt,
            updated: guide.updatedAt,
          }),
          breadcrumbSchema([
            { name: "LegLike", path: "/" },
            { name: "Rehab Guides", path: "/rehab-guides" },
            { name: guide.title, path: `/rehab-guides/${guide.slug}` },
          ]),
          ...(faq.length ? [faqSchema(faq)] : []),
        ])}
      />
      <div className="border-b border-neutral-800/60 sticky top-0 bg-neutral-950/95 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-lime-400 font-bold hover:text-lime-300">
            LegLike
          </Link>
          <Link href="/rehab-guides" className="text-sm text-neutral-400 hover:text-white">
            ← All Guides
          </Link>
        </div>
      </div>

      <main>
        <article className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium bg-lime-400/10 text-lime-400 px-2 py-1 rounded-full">
                {guide.region.replace("_", " ")}
              </span>
              <span className="text-sm text-neutral-500">{formatDate(guide.createdAt)}</span>
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight mb-4">{guide.title}</h1>
            <p className="text-lg text-neutral-400 leading-relaxed">{guide.excerpt}</p>
          </div>

          {guide.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={guide.coverImage}
              alt={guide.title}
              className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-8"
            />
          )}

          <div className="mb-8 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-200/90">
            This guide is general information, not a diagnosis. If symptoms are severe, persistent,
            or getting worse, see a doctor or physical therapist.
          </div>

          <ShareButtons title={guide.title} slug={guide.slug} basePath="/rehab-guides" />

          <hr className="border-neutral-800 my-8" />

          <div className="prose prose-invert prose-neutral prose-headings:text-white prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-3 prose-p:text-neutral-300 prose-p:leading-relaxed prose-li:text-neutral-300 prose-strong:text-white prose-a:text-lime-400 max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h2 className="text-2xl font-bold text-white mt-8 mb-3">{children}</h2>
                ),
              }}
            >
              {guide.content}
            </ReactMarkdown>
          </div>

          <div className="mt-10 pt-6 border-t border-neutral-800">
            <ShareButtons title={guide.title} slug={guide.slug} basePath="/rehab-guides" />
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
            <h3 className="font-bold text-white text-lg mb-1">Build your recovery plan with LegLike</h3>
            <p className="text-neutral-400 text-sm mb-4">
              Personalized lower-body strength, mobility and rehab plans, powered by AI. Free to
              start.
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
            <h3 className="font-bold text-white text-lg mb-6">Related guides</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/rehab-guides/${r.slug}`}
                  className="block rounded-xl border border-neutral-800 p-4 hover:border-lime-400/50 transition-colors"
                >
                  <h4 className="font-semibold text-white text-sm mb-1 leading-snug">{r.title}</h4>
                  <p className="text-xs text-neutral-400 line-clamp-2">{r.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
