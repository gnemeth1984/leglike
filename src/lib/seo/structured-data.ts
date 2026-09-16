/**
 * JSON-LD structured data.
 *
 * Google uses this to understand what LegLike *is* rather than inferring it
 * from prose. It's what makes an entity eligible for a knowledge panel on a
 * brand search, and Article markup is what gets blog posts author/date
 * treatment in results. Cheap to add, and without it a new brand looks like
 * an unclassified page to a crawler.
 */

export const SITE_URL = "https://leglike.com";

/**
 * Third-party corroboration (directory listings, review sites) goes here once
 * LegLike has any worth citing. Empty for now rather than invented — a
 * `sameAs` pointing at a 404 or an unrelated page is a bad signal, not a
 * neutral one.
 */
const ORG_SAME_AS: string[] = [];

/** Publisher identity — reused so every page points at one consistent entity. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "LegLike",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
    },
    description:
      "LegLike builds personalized lower-body strength, mobility and rehab programs with AI — for training performance or recovering from injury.",
    knowsAbout: [
      "Lower-body strength training",
      "Mobility assessment",
      "Injury rehabilitation",
      "Hip, knee and ankle mobility",
      "AI-generated workout programming",
    ],
    sameAs: ORG_SAME_AS,
  };
}

/**
 * The product itself, with pricing. Prices must stay in step with the pricing
 * page — contradicting your own visible pricing is worse than omitting the
 * offers entirely.
 */
export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: "LegLike",
    applicationCategory: "HealthApplication",
    applicationSubCategory: "Fitness and Rehab Software",
    operatingSystem: "Web",
    featureList: [
      "AI workout generator",
      "Mobility assessment (hip, knee, ankle, balance)",
      "Phased rehab plans",
      "Exercise library",
      "Progress tracking",
      "Equipment-adaptive programming (home, gym, clinic)",
    ],
    url: SITE_URL,
    description:
      "AI-powered lower-body training: personalized strength, mobility and rehab programs for performance training or injury recovery.",
    publisher: { "@id": `${SITE_URL}/#organization` },
    offers: [
      { name: "Free", price: "0", description: "1 mobility assessment, exercise library, 1 AI workout plan / month" },
      { name: "Pro", price: "9", description: "Unlimited AI workout plans, rehab plans, assessments and progress tracking" },
      { name: "Clinic", price: "16", description: "Everything in Pro plus multi-client management and a clinician dashboard" },
    ].map((o) => ({
      "@type": "Offer",
      name: o.name,
      price: o.price,
      priceCurrency: "USD",
      description: o.description,
      url: `${SITE_URL}/pricing`,
      availability: "https://schema.org/InStock",
    })),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "LegLike",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function articleSchema(opts: {
  title: string;
  description?: string | null;
  slug: string;
  published: Date;
  updated: Date;
  /** Defaults to "blog" — pass "exercises" or "rehab-guides" for those page types. */
  basePath?: string;
}) {
  const url = `${SITE_URL}/${opts.basePath ?? "blog"}/${opts.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: opts.title,
    description: opts.description || undefined,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: opts.published.toISOString(),
    dateModified: opts.updated.toISOString(),
    author: { "@type": "Organization", name: "LegLike", url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${t.path}`,
    })),
  };
}

/**
 * FAQPage schema. Worth adding wherever an article genuinely answers discrete
 * questions: it makes the page eligible for the "People also ask" style
 * treatment and gives AI answer engines something clean to quote.
 */
export function faqSchema(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Renders a JSON-LD block. Server-rendered so crawlers see it in the HTML. */
export function jsonLdProps(schema: object | object[]) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(schema) },
  } as const;
}
