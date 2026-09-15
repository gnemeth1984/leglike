import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { jsonLdProps, breadcrumbSchema, SITE_URL } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Blog | LegLike",
  description:
    "AI-driven guidance on lower-body strength, mobility and rehab — training, injury prevention, and recovery for athletes and everyday movers.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 3600;

const CATEGORY_LABELS: Record<string, string> = {
  training: "Training",
  rehab: "Rehab",
  mobility: "Mobility",
  injury: "Injury Prevention",
  strength: "Strength",
  clinician: "For Clinicians",
  product: "LegLike",
};

const CATEGORY_COLORS: Record<string, string> = {
  training: "bg-lime-400/10 text-lime-400",
  rehab: "bg-blue-400/10 text-blue-400",
  mobility: "bg-purple-400/10 text-purple-400",
  injury: "bg-red-400/10 text-red-400",
  strength: "bg-orange-400/10 text-orange-400",
  clinician: "bg-teal-400/10 text-teal-400",
  product: "bg-lime-400/10 text-lime-400",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPage() {
  const posts = await prisma.blogPost
    .findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { slug: true, title: true, excerpt: true, category: true, createdAt: true, coverImage: true },
    })
    .catch(() => []);

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    name: "LegLike Blog",
    description:
      "AI-driven guidance on lower-body strength, mobility and rehab for athletes, everyday movers, and post-injury recovery.",
    url: `${SITE_URL}/blog`,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.createdAt.toISOString(),
      ...(post.coverImage ? { image: post.coverImage } : {}),
      author: { "@type": "Organization", name: "LegLike", url: SITE_URL },
    })),
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${post.slug}`,
      name: post.title,
    })),
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <script
        {...jsonLdProps([
          blogSchema,
          itemListSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ])}
      />
      {/* Header */}
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
          <h1 className="text-4xl font-bold text-white mt-4 mb-3">Blog</h1>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            Training, mobility and rehab guidance for athletes and everyday movers, written from
            what actually works in a rehab plan.
          </p>
        </div>
      </div>

      {/* Posts */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-xl">Articles coming soon — check back tomorrow.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden hover:border-lime-400/50 hover:shadow-lg hover:shadow-lime-400/5 transition-all group"
              >
                {post.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverImage} alt={post.title} loading="lazy" className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-neutral-800 to-neutral-900" />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        CATEGORY_COLORS[post.category] || "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {CATEGORY_LABELS[post.category] || post.category}
                    </span>
                  </div>
                  <h2 className="font-semibold text-white group-hover:text-lime-400 transition-colors mb-2 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-neutral-400 line-clamp-3 mb-4">{post.excerpt}</p>
                  <p className="text-xs text-neutral-500">{formatDate(post.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-lime-400 rounded-2xl p-8 text-center text-neutral-950">
          <h3 className="text-2xl font-bold mb-2">Build your program with LegLike</h3>
          <p className="text-neutral-800 mb-6">
            Personalized lower-body strength, mobility and rehab plans, powered by AI. Free to start.
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
