/**
 * lib/seo/keywords.ts — free keyword research.
 *
 * The paid tools sell "keyword research" as if it needed a licensed database.
 * It doesn't. Two free sources cover the job:
 *
 *  1. Google Suggest (suggestqueries.google.com) — the autocomplete list. No
 *     key, no quota worth worrying about. Every suggestion is a query real
 *     people type often enough for Google to bother suggesting it, which is a
 *     better relevance signal than a scraped monthly volume number.
 *  2. Search Console (lib/seo/gsc.ts) — queries the site ALREADY shows up for.
 *     Anything sitting at position 5-20 is the cheapest traffic on earth: one
 *     properly targeted article instead of hoping to rank from nothing.
 *
 * We deliberately do NOT invent volume/difficulty numbers. A made-up "KD 34"
 * looks authoritative and means nothing. Priority is scored from things we can
 * actually observe.
 */

const SUGGEST_ENDPOINT = "https://suggestqueries.google.com/complete/search";

/**
 * Seed terms: the topical map for LegLike's vertical — lower-body strength,
 * mobility and injury rehab, AI-programmed. Each seed is a cluster — the
 * harvester fans each one out into dozens of long-tail children, which is
 * what actually ranks.
 */
export const SEED_CLUSTERS: { cluster: string; seeds: string[]; intent: Intent }[] = [
  {
    cluster: "AI workout & training apps",
    intent: "commercial",
    seeds: [
      "AI workout generator",
      "AI personal trainer app",
      "leg workout app",
      "lower body training app",
      "AI fitness app for legs",
      "strength training app with AI",
      "personalized workout plan app",
    ],
  },
  {
    cluster: "mobility assessment",
    intent: "commercial",
    seeds: [
      "mobility assessment app",
      "hip mobility test",
      "knee mobility screen",
      "ankle mobility test",
      "AI movement assessment",
      "balance assessment app",
      "functional movement screen app",
    ],
  },
  {
    cluster: "knee rehab & recovery",
    intent: "informational",
    seeds: [
      "knee rehab exercises",
      "ACL recovery exercises",
      "knee pain exercises app",
      "post surgery knee rehab plan",
      "runner's knee exercises",
      "knee rehab app",
      "physical therapy app for knee pain",
    ],
  },
  {
    cluster: "hip & glute rehab",
    intent: "informational",
    seeds: [
      "hip pain exercises",
      "hip mobility exercises",
      "glute activation exercises",
      "hip impingement exercises",
      "hip rehab app",
      "piriformis syndrome exercises",
    ],
  },
  {
    cluster: "ankle & foot rehab",
    intent: "informational",
    seeds: [
      "ankle sprain rehab exercises",
      "ankle mobility exercises",
      "plantar fasciitis exercises",
      "ankle rehab app",
      "ankle strengthening exercises",
    ],
  },
  {
    cluster: "leg strength & mobility how-to",
    intent: "informational",
    seeds: [
      "how to improve leg mobility",
      "how to build leg strength at home",
      "leg day exercises without weights",
      "how to fix tight hips",
      "how to improve squat mobility",
      "stretches for tight hamstrings",
    ],
  },
  {
    cluster: "injury prevention",
    intent: "informational",
    seeds: [
      "injury prevention exercises for runners",
      "how to prevent knee injuries",
      "prehab exercises",
      "return to running after injury plan",
      "warm up exercises to prevent injury",
    ],
  },
  {
    // LegLike's actual differentiator: one AI system that spans training AND
    // rehab, adapting to equipment on hand. No competitor named in AI answers
    // owns "one app for training and rehab" — that's unowned ground with a
    // shipped feature behind it.
    cluster: "training + rehab in one app",
    intent: "commercial",
    seeds: [
      "app that combines training and physical therapy",
      "workout app for injury recovery",
      "AI app for athletes coming back from injury",
      "home workout app for rehab and strength",
      "app for physios and clients to track rehab",
    ],
  },
  {
    cluster: "clinician & PT tools",
    intent: "commercial",
    seeds: [
      "app for physical therapists to assign exercises",
      "clinician dashboard for rehab exercises",
      "software for physiotherapy clinics",
      "multi client rehab tracking app",
    ],
  },
  {
    cluster: "competitor & alternatives",
    intent: "commercial",
    seeds: [
      "Hinge Health alternative",
      "Sword Health alternative",
      "Kaia Health alternative",
      "best AI physical therapy app",
      "best knee rehab app",
    ],
  },
];

export type Intent = "informational" | "commercial" | "transactional" | "local";

/**
 * Modifiers appended to each seed before hitting autocomplete. Google returns a
 * different list per prefix, so "X for" and "X vs" surface queries that a bare
 * "X" never shows. This is the whole trick behind paid "keyword expansion".
 */
const MODIFIERS = [
  "",
  "for",
  "best",
  "how to",
  "what is",
  "vs",
  "cost",
  "at home",
  "uk",
  "us",
  // "free" is deliberately absent, same reasoning as Rotahr: it harvests a
  // family of "best free ... app" queries isUsable() rejects anyway.
  "for beginners",
  "for runners",
  "app",
];

export type Suggestion = { keyword: string; cluster: string; intent: Intent; source: "suggest" };

/** One autocomplete call. Returns [] on any failure — never throw a harvest. */
export async function googleSuggest(query: string, region = "us"): Promise<string[]> {
  const url = `${SUGGEST_ENDPOINT}?client=firefox&hl=en&gl=${region}&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LegLikeSEO/1.0)" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    // client=firefox returns ["query", ["suggestion", ...]]
    const json = (await res.json()) as [string, string[]];
    return Array.isArray(json?.[1]) ? json[1] : [];
  } catch {
    return [];
  }
}

/** Guess intent from the wording. Crude, but it only steers priority. */
export function classifyIntent(keyword: string, fallback: Intent): Intent {
  const k = keyword.toLowerCase();
  if (/\bnear me\b|\bin (london|dublin|manchester|new york)\b/.test(k)) return "local";
  if (/\b(pricing|price|buy|demo|free trial|sign up)\b/.test(k)) return "transactional";
  if (/\b(best|top|app|software|system|alternative|vs|compare|review)\b/.test(k))
    return "commercial";
  if (/\b(how|what|why|when|guide|exercises|checklist)\b/.test(k)) return "informational";
  return fallback;
}

/**
 * Territory where two things are true at once: LegLike ships the feature, and
 * an AI-visibility check shows no competitor is named for the answer. Nobody
 * owns these questions yet, so a new domain can take them.
 */
const FEATURE_GAP: RegExp[] = [
  /\bmobility assessment\b/,
  /\bmovement screen\b/,
  /\bAI (workout|training|rehab)\b/i,
  /\brehab plan\b/,
  /\bphased (recovery|rehab)\b/,
  /\bcombine[s]? training and (rehab|physical therapy|physio)\b/,
  /\bclinician dashboard\b/,
  /\bequipment[- ]adaptive\b/,
];

/** The market LegLike actually sells to: people training or rehabbing the lower body. */
const OUR_VERTICAL =
  /\b(leg|legs|knee|hip|ankle|glute|hamstring|quad|calf|foot|feet|lower body|mobility|rehab|physio|physical therapy|prehab|injury|recovery|runner|running|athlete)s?\b/i;

/** Industries/verticals LegLike does not serve — pollutes autocomplete because
 * "app"/"software" is a generic category. */
const OFF_VERTICAL = new RegExp(
  "\\b(" +
    [
      "restaurant", "hospitality", "warehouse", "construction", "manufacturing",
      "call cent(er|re)", "retail store", "salon", "spa", "daycare", "childcare",
      "accounting software", "payroll software", "invoicing", "crm for sales",
      "real estate", "trucking", "logistics",
    ].join("|") +
    ")\\b",
  "i"
);

const OFF_MARKET = new RegExp(
  "\\b(" +
    [
      "india", "indian", "nepal", "bangladesh", "pakistan", "sri lanka", "philippines",
      "indonesia", "malaysia", "singapore", "vietnam", "thailand", "china", "japan",
      "nigeria", "kenya", "ghana", "south africa", "egypt", "dubai", "uae", "saudi",
      "brazil", "mexico", "argentina", "chile", "colombia", "peru",
      "kolkata", "mumbai", "delhi", "bangalore", "karachi", "lahore", "dhaka",
      "russia", "ukraine",
    ].join("|") +
    ")\\b",
  "i"
);

const NEVER_CONVERTS = new RegExp(
  "(" +
    [
      "\\bfree download\\b", "\\bdownload free\\b", "\\bfreeware\\b", "\\bopen source\\b",
      "\\bfor sale\\b", "\\bfull version\\b", "\\bcracked\\b", "\\btorrent\\b",
      "\\bfree\\b[^.]{0,40}\\b(app|software|tool|program)s?\\b",
    ].join("|") +
    ")",
  "i"
);

const DIY_OR_DEV = new RegExp(
  "(" +
    [
      "\\b(php|mysql|python|javascript|java|c#|\\.net|react|node ?js)\\b",
      "\\bsource code\\b", "\\bgithub\\b", "\\bapi (tutorial|documentation)\\b",
      "\\bhow to (build|code|program|develop) (an?|the) app\\b",
    ].join("|") +
    ")",
  "i"
);

const STOP_PATTERNS = [
  /\bjob(s)?\b/i,
  /\bsalary\b/i,
  /\bcv\b/i,
  /\bpdf\b/i,
  /\breddit\b/i,
  /\bcrack|torrent|nulled\b/i,
];

/**
 * A generic category head term with no narrowing angle at all — defended by
 * MyFitnessPal, Fitbod, Nike Training Club and every gym-bro app with a
 * decade of authority. Kept in the map, buried in the queue.
 */
const CATEGORY_TERM = /\b(workout|fitness|training)\b[^.]{0,24}\b(app|software|tool|platform)s?\b/;

export function isDefendedHeadTerm(keyword: string): boolean {
  const k = keyword.toLowerCase();
  if (!CATEGORY_TERM.test(k)) return false;
  if (FEATURE_GAP.some((re) => re.test(k))) return false;
  if (OUR_VERTICAL.test(k)) return false; // naming leg/knee/hip/rehab already narrows it
  return true;
}

const GENERIC_INTENT = new RegExp(
  "\\b(" +
    [
      "how", "what", "why", "when", "which", "best", "top", "cheap\\w*",
      "guide\\w*", "vs", "versus", "alternativ\\w*", "compar\\w*", "tips",
      "app", "apps", "software", "platform", "tool\\w*", "exercise\\w*",
      "workout\\w*", "rehab\\w*", "mobility", "stretch\\w*", "strength\\w*",
      "pain", "injury", "recover\\w*", "assessment\\w*", "screen\\w*",
      "cost\\w*", "pric\\w*", "plan\\w*", "program\\w*", "routine\\w*",
      "physio\\w*", "therapy", "clinician\\w*", "prehab", "return to",
    ].join("|") +
    ")\\b",
  "i"
);

/** Drop queries that can never convert for LegLike. */
export function isUsable(keyword: string): boolean {
  const k = keyword.trim();
  if (k.length < 6 || k.length > 90) return false;
  if (!/^[a-z0-9 '&/.+-]+$/i.test(k)) return false;
  if (OFF_MARKET.test(k)) return false;
  if (OFF_VERTICAL.test(k)) return false;
  if (NEVER_CONVERTS.test(k)) return false;
  if (DIY_OR_DEV.test(k)) return false;
  if (!GENERIC_INTENT.test(k)) return false;
  return !STOP_PATTERNS.some((re) => re.test(k));
}

/**
 * Score a keyword. Higher = write it sooner. Same shape as Rotahr's version:
 * continuous signals (striking distance, impressions, feature-gap ownership,
 * vertical fit, specificity) rather than a bucketed score that ties hundreds
 * of candidates together.
 */
export function scoreKeyword(k: {
  keyword: string;
  intent: string;
  impressions?: number;
  clicks?: number;
  position?: number | null;
}): number {
  let score = 0;
  const key = k.keyword.trim().toLowerCase();
  const words = key.split(/\s+/).length;

  score += Math.min(30, Math.max(0, (words - 2) * 6));
  score += { transactional: 30, commercial: 24, local: 18, informational: 10 }[k.intent] ?? 10;

  if (OUR_VERTICAL.test(key)) score += 22;
  if (FEATURE_GAP.some((re) => re.test(key))) score += 28;

  if (/\b\d+\s*(weeks?|days?|reps?|sets?)\b/.test(key)) score += 10;
  if (/^(how|what|why|when|do|does|is|are|can|should)\b/.test(key)) score += 8;

  if (isDefendedHeadTerm(key)) score -= 45;

  const pos = k.position ?? null;
  if (pos !== null && pos > 0) {
    if (pos >= 4 && pos <= 20) score += 45;
    else if (pos > 20 && pos <= 50) score += 20;
    else if (pos < 4) score -= 20;
  }

  const imp = k.impressions ?? 0;
  if (imp > 0) score += Math.min(40, Math.round(Math.log2(imp + 1) * 6));
  if (imp > 50 && (k.clicks ?? 0) === 0) score += 15;

  return score;
}

/**
 * Fan every seed out through the modifier list and collect unique suggestions.
 * A small worker pool with a hard time budget, same tradeoff as Rotahr's.
 */
export async function harvestSuggestions(
  clusters = SEED_CLUSTERS,
  regions: string[] = ["us", "gb"],
  opts: { concurrency?: number; budgetMs?: number } = {}
): Promise<Suggestion[]> {
  const concurrency = opts.concurrency ?? 6;
  const budgetMs = opts.budgetMs ?? 180_000;
  const startedAt = Date.now();

  const jobs: { query: string; region: string; cluster: string; intent: Intent }[] = [];
  for (const { cluster, seeds, intent } of clusters) {
    for (const seed of seeds) {
      for (const mod of MODIFIERS) {
        const query = !mod
          ? seed
          : ["for", "vs", "cost", "uk", "us"].includes(mod)
          ? `${seed} ${mod}`
          : `${mod} ${seed}`;
        for (const region of regions) jobs.push({ query, region, cluster, intent });
      }
    }
  }

  const found = new Map<string, Suggestion>();
  let cursor = 0;

  async function worker() {
    while (cursor < jobs.length && Date.now() - startedAt < budgetMs) {
      const job = jobs[cursor++];
      const suggestions = await googleSuggest(job.query, job.region);
      for (const raw of suggestions) {
        const keyword = raw.trim().toLowerCase();
        if (!isUsable(keyword) || found.has(keyword)) continue;
        found.set(keyword, {
          keyword,
          cluster: job.cluster,
          intent: classifyIntent(keyword, job.intent),
          source: "suggest",
        });
      }
      await new Promise((r) => setTimeout(r, 60));
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return [...found.values()];
}

/** "People also ask"-style question expansion, used to build an article's FAQ block. */
export async function questionsFor(keyword: string, max = 6): Promise<string[]> {
  const prefixes = ["how", "what", "why", "when", "do", "is"];
  const out = new Set<string>();

  const topic = new Set(
    keyword
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3 && !["what", "does", "with", "your", "best", "cost"].includes(w))
  );
  const onTopic = (q: string) => {
    const words = q.toLowerCase().split(/\s+/);
    return topic.size === 0 || words.some((w) => topic.has(w.replace(/[^a-z]/g, "")));
  };

  for (const p of prefixes) {
    const suggestions = await googleSuggest(`${p} ${keyword}`);
    for (const s of suggestions) {
      const q = s.trim();
      if (
        q.split(/\s+/).length >= 4 &&
        /^(how|what|why|when|do|does|is|are|can)\b/i.test(q) &&
        onTopic(q)
      ) {
        out.add(q.charAt(0).toUpperCase() + q.slice(1) + "?");
      }
      if (out.size >= max) break;
    }
    if (out.size >= max) break;
    await new Promise((r) => setTimeout(r, 120));
  }

  return [...out].slice(0, max);
}

/** Token overlap between two queries, 0-1. Used to refuse writing a near-duplicate article. */
export function similarity(a: string, b: string): number {
  const norm = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !["for", "the", "and", "with", "your", "how", "what"].includes(w))
    );
  const A = norm(a);
  const B = norm(b);
  if (A.size === 0 || B.size === 0) return 0;
  let shared = 0;
  A.forEach((w) => {
    if (B.has(w)) shared++;
  });
  return shared / Math.min(A.size, B.size);
}
