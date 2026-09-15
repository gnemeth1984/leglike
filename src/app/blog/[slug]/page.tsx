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
  const posts = await prisma.blogPost
    .findMany({ where: { published: true }, select: { slug: true } })
    .catch(() => []);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost
    .findUnique({
      where: { slug, published: true },
      select: { metaTitle: true, metaDesc: true, title: true, coverImage: true },
    })
    .catch(() => null);
  if (!post) return { title: "Not Found" };

  // Covers live in a private blob store, so the public proxy route is the
  // only URL a crawler can fetch. Absolute, because LinkedIn and Facebook
  // ignore relative og:image values even with metadataBase set.
  const cover = post.coverImage
    ? post.coverImage.startsWith("http")
      ? post.coverImage
      : `https://leglike.com${post.coverImage.startsWith("/") ? "" : "/"}${post.coverImage}`
    : null;

  return {
    title: post.metaTitle || post.title,
    description: post.metaDesc,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.metaTitle || post.title,
      description: post.metaDesc || "",
      url: `/blog/${slug}`,
      ...(cover ? { images: [{ url: cover, width: 1200, height: 630, alt: post.title }] } : {}),
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title: post.metaTitle || post.title,
      description: post.metaDesc || "",
      ...(cover ? { images: [cover] } : {}),
    },
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  training: "Training",
  rehab: "Rehab",
  mobility: "Mobility",
  injury: "Injury Prevention",
  strength: "Strength",
  clinician: "For Clinicians",
  product: "LegLike",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
  });
  if (!post) notFound();

  // FAQ block written by the autopilot from real related searches. Stored as
  // JSON so a bad row can never break the page.
  let faq: { q: string; a: string }[] = [];
  if (post.faq) {
    try {
      const parsed = JSON.parse(post.faq);
      if (Array.isArray(parsed)) faq = parsed.filter((f) => f?.q && f?.a).slice(0, 8);
    } catch {
      faq = [];
    }
  }

  const related = await prisma.blogPost.findMany({
    where: { published: true, category: post.category, slug: { not: post.slug } },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { slug: true, title: true, excerpt: true, createdAt: true },
  });

  return (
    <div className="min-h-screen bg-neutral-950">
      <script
        {...jsonLdProps([
          articleSchema({
            title: post.title,
            description: post.metaDesc || post.excerpt,
            slug: post.slug,
            published: post.createdAt,
            updated: post.updatedAt,
          }),
          breadcrumbSchema([
            { name: "LegLike", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          ...(faq.length ? [faqSchema(faq)] : []),
        ])}
      />
      {/* Nav */}
      <div className="border-b border-neutral-800/60 sticky top-0 bg-neutral-950/95 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-lime-400 font-bold hover:text-lime-300">
            LegLike
          </Link>
          <Link href="/blog" className="text-sm text-neutral-400 hover:text-white">
            ← All Articles
          </Link>
        </div>
      </div>

      <main>
        <article className="max-w-3xl mx-auto px-6 py-12">
          {/* Meta */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium bg-lime-400/10 text-lime-400 px-2 py-1 rounded-full">
                {CATEGORY_LABELS[post.category] || post.category}
              </span>
              <span className="text-sm text-neutral-500">{formatDate(post.createdAt)}</span>
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight mb-4">{post.title}</h1>
            <p className="text-lg text-neutral-400 leading-relaxed">{post.excerpt}</p>
          </div>

          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-8"
            />
          )}

          <ShareButtons title={post.title} slug={post.slug} />

          <hr className="border-neutral-800 my-8" />

          {/* Content */}
          <div className="prose prose-invert prose-neutral prose-headings:text-white prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-3 prose-p:text-neutral-300 prose-p:leading-relaxed prose-li:text-neutral-300 prose-strong:text-white prose-a:text-lime-400 max-w-none">
            <ReactMarkdown
              components={{
                // The generated body often repeats the title as its own `# H1`,
                // which gave these pages two H1s. Demote any body H1 to H2 so the
                // template heading stays the single topical signal.
                h1: ({ children }) => (
                  <h2 className="text-2xl font-bold text-white mt-8 mb-3">{children}</h2>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="mt-10 pt-6 border-t border-neutral-800">
            <ShareButtons title={post.title} slug={post.slug} />
          </div>

          {/* FAQ — answers the related searches Google shows for this query */}
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

          {/* CTA inline */}
          <div className="mt-12 bg-lime-400/5 border border-lime-400/20 rounded-2xl p-6">
            <h3 className="font-bold text-white text-lg mb-1">Build your program with LegLike</h3>
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

      {/* Related posts */}
      {related.length > 0 && (
        <div className="border-t border-neutral-800/60 bg-neutral-900/40 py-12">
          <div className="max-w-3xl mx-auto px-6">
            <h3 className="font-bold text-white text-lg mb-6">Related articles</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="block rounded-xl border border-neutral-800 p-4 hover:border-lime-400/50 transition-colors"
                >
                  <h4 className="font-semibold text-white text-sm mb-1 leading-snug">{p.title}</h4>
                  <p className="text-xs text-neutral-400 line-clamp-2">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
