import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { competitors } from "@/lib/seo/competitors";

// Canonical production domain. Must stay leglike.com — the Vercel subdomain
// would split ranking signals across two hostnames.
const baseUrl = "https://leglike.com";

// Rebuild hourly so newly published blog posts appear without waiting for the
// next deploy.
export const revalidate = 3600;

/**
 * When the static pages below last materially changed.
 *
 * Deliberately coarse: bumping it marks every static page as touched, which
 * is slightly imprecise but truthful at the day level and far better than
 * claiming continuous change on a route that regenerates hourly. Blog URLs
 * below keep their real per-row updatedAt.
 *
 * Bump this when you ship a change to a static marketing page.
 */
const STATIC_UPDATED = new Date("2026-09-15T00:00:00Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.blogPost
    .findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  const blogUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: `${baseUrl}/`, lastModified: STATIC_UPDATED, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/exercises`, lastModified: STATIC_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: STATIC_UPDATED, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    // Comparison pages: highest commercial intent on the site, so they carry
    // a priority just under the landing page.
    ...competitors.map((c) => ({
      url: `${baseUrl}/compare/${c.slug}`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: `${baseUrl}/auth/signup`, lastModified: STATIC_UPDATED, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/auth/signin`, lastModified: STATIC_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    ...blogUrls,
  ];
}
