/**
 * Competitor data for the /compare pages.
 *
 * RULES FOR EDITING THIS FILE — read before changing a number.
 *
 * 1. Only use pricing the vendor publishes on their OWN site or app store
 *    listing. Third-party review sites drift and are frequently stale.
 * 2. Every entry carries `pricingSource` and `pricingChecked`. If you can't
 *    cite it, don't claim it.
 * 3. Where a vendor doesn't self-pay (employer/insurer-covered only, no
 *    public consumer price), say so plainly — that's itself useful
 *    information for a buyer comparing options.
 * 4. Never overstate a weakness. These are named, trading companies; a false
 *    factual claim about a competitor is a legal risk, not just a
 *    credibility one.
 * 5. Every page must include a genuine `whereTheyWin`. A comparison with no
 *    losses reads as marketing and converts worse than an honest one.
 */

export interface Competitor {
  slug: string;
  name: string;
  short: string;
  positioning: string;
  pricingModel: "per-user" | "employer-covered" | "flat" | "on-request";
  pricingSummary: string;
  pricingSource: string;
  pricingChecked: string;
  /** Worked monthly cost for a self-paying individual user, or null if unpublished/N-A. */
  exampleCostMonthly: string | null;
  whereTheyWin: string[];
  gaps: string[];
  verdict: string;
  pickThemIf: string;
  faqs: { q: string; a: string }[];
}

export const LEGLIKE_PRICING = {
  free: 0,
  pro: 9,
  clinic: 16,
  currency: "USD",
  note: "Free tier capped at 1 assessment + 1 AI plan/month. Pro and Clinic are flat monthly subscriptions, no per-visit or per-session billing.",
};

export function getCompetitor(slug: string): Competitor | undefined {
  return competitors.find((c) => c.slug === slug);
}

export const competitors: Competitor[] = [
  {
    slug: "hinge-health",
    name: "Hinge Health",
    short: "Hinge Health",
    positioning:
      "Enterprise musculoskeletal (MSK) care platform sold to employers and health plans, pairing an app with human physical therapists and coaches.",
    pricingModel: "employer-covered",
    pricingSummary:
      "Not sold directly to consumers. Hinge Health's own site states there is no out-of-pocket cost to members when access comes through an employer or health plan; it does not publish a self-pay consumer price.",
    pricingSource: "https://www.hingehealth.com/resources/articles/physical-therapy-cost-calculator/",
    pricingChecked: "2026-09-15",
    exampleCostMonthly: null,
    whereTheyWin: [
      "Human physical therapists and health coaches are part of the program, not just an algorithm.",
      "Backed by published outcomes research and a large enterprise/insurer distribution network.",
      "Often genuinely free to the member when covered by an employer or health plan.",
    ],
    gaps: [
      "You can't just sign up and pay — access is gated behind your employer or insurer offering it, and most people's don't.",
      "Built for enterprise benefits distribution, not for someone who wants to start training or rehabbing today on their own dime.",
      "No published self-serve pricing, so there's no way to compare cost directly if you don't have access through a plan.",
    ],
    verdict:
      "The strongest option if your employer or insurer already offers it — genuinely free, clinician-backed care. Not an option at all if they don't, since there's no way to buy it directly.",
    pickThemIf:
      "Your employer or health plan already covers Hinge Health and you want a human PT involved, not just an app.",
    faqs: [
      {
        q: "Is LegLike cheaper than Hinge Health?",
        a: "Hinge Health doesn't sell direct to consumers — it's free when your employer or insurer covers it, and unavailable if they don't. LegLike is $9/month self-pay with no employer needed, so it's the option if you don't have Hinge Health access.",
      },
      {
        q: "Can I use Hinge Health without my employer offering it?",
        a: "No — Hinge Health is distributed through employers and health plans, not sold directly. LegLike is available to anyone who signs up.",
      },
    ],
  },
  {
    slug: "curovate",
    name: "Curovate",
    short: "Curovate",
    positioning:
      "A physical therapy app focused specifically on pre- and post-surgery knee recovery — ACL, knee replacement, knee osteoarthritis.",
    pricingModel: "per-user",
    pricingSummary:
      "Published subscription tiers: $4.99/week, $12.99/month, or $45.99/year, plus a $174.99 Premium annual tier and a separate paid video-PT add-on.",
    pricingSource: "https://curovate.com/terms.html",
    pricingChecked: "2026-09-15",
    exampleCostMonthly: "$12.99/month (monthly plan)",
    whereTheyWin: [
      "Deep, specific programming for knee surgery recovery — ACL and knee replacement protocols are the whole product, not one category among many.",
      "In-app chat with a licensed physical therapist is included on some tiers.",
      "A structured multi-month rehab timeline built around a single, well-defined recovery path.",
    ],
    gaps: [
      "Scoped to knee surgery recovery — no general strength training, no hip/ankle-focused programs, no non-surgical rehab paths.",
      "More expensive at the entry tier ($12.99/mo) than LegLike's Pro plan ($9/mo) for a narrower use case.",
      "No mobility assessment or AI-generated strength programming outside the rehab track.",
    ],
    verdict:
      "A solid, purpose-built option if you specifically need a structured knee-surgery recovery plan and nothing else. Narrower than LegLike, which also covers hip/ankle/glute rehab and ongoing strength training in the same app.",
    pickThemIf:
      "You're recovering from a specific knee surgery (ACL, replacement) and want a program built around exactly that, with PT chat included.",
    faqs: [
      {
        q: "Is LegLike cheaper than Curovate?",
        a: "Yes — LegLike's Pro plan is $9/month against Curovate's $12.99/month entry tier, and LegLike also covers hip, ankle and general strength training, not just knee surgery recovery.",
      },
      {
        q: "Does LegLike work for ACL recovery like Curovate?",
        a: "LegLike builds phased rehab plans for knee conditions including post-surgery recovery, but Curovate's programs are more narrowly built around specific surgical protocols. If your recovery is knee-surgery-specific and you want that depth, Curovate is worth a look.",
      },
    ],
  },
  {
    slug: "kemtai",
    name: "Kemtai",
    short: "Kemtai",
    positioning:
      "Computer-vision motion-tracking platform that watches your form through your camera in real time, sold to consumers and licensed to clinics/health systems.",
    pricingModel: "per-user",
    pricingSummary:
      "Consumer subscription reported at $19–$40/month depending on the plan by independent reviews; enterprise/clinic licensing is separately negotiated and not publicly priced.",
    pricingSource: "https://www.laptopmag.com/reviews/kemtai-adaptive-home-exercise-platform",
    pricingChecked: "2026-09-15",
    exampleCostMonthly: "$19–$40/month (reported)",
    whereTheyWin: [
      "Real-time computer-vision rep counting and form feedback through your device's camera — a genuinely different technical approach from a static exercise library.",
      "Also sells into hospitals and health systems for supervised rehab, which is a stronger clinical distribution story.",
      "Wide range of trainer-led sessions in addition to rehab content.",
    ],
    gaps: [
      "More expensive than LegLike's Pro plan at every reported price point.",
      "Camera-based form tracking requires space and setup that isn't always practical, and doesn't help with a self-guided mobility assessment.",
      "General fitness/PT breadth rather than LegLike's specific focus on lower-body strength and rehab programming.",
    ],
    verdict:
      "Worth it if real-time camera form-checking is the feature you actually want. LegLike doesn't do computer-vision rep tracking; it does AI-programmed lower-body plans and assessments at a lower price.",
    pickThemIf:
      "You want live camera feedback on your exercise form and are fine paying more for it.",
    faqs: [
      {
        q: "Does LegLike track my form with my camera like Kemtai?",
        a: "No — LegLike focuses on AI-generated programming and a self-reported mobility assessment, not real-time computer-vision form tracking. If live camera feedback is what you need, Kemtai does that; if you want lower-body-specific programming at a lower price, LegLike does that.",
      },
    ],
  },
  {
    slug: "pliability",
    name: "Pliability",
    short: "Pliability",
    positioning:
      "A daily mobility and stretching app (formerly ROMWOD) with a large video library, aimed at athletes wanting flexibility and recovery work.",
    pricingModel: "per-user",
    pricingSummary:
      "Published at $17.95/month, or a discounted annual plan around $14.99/month equivalent, after a 7-day free trial.",
    pricingSource: "https://www.wickedsmartgolf.com/blog/pliability-app-review",
    pricingChecked: "2026-09-15",
    exampleCostMonthly: "$17.95/month",
    whereTheyWin: [
      "A large, polished video library of guided daily mobility sessions with real coaches on screen.",
      "Established brand in the CrossFit and athletic performance community with years of content.",
      "Purpose-built daily routine format that's easy to follow without thinking about programming.",
    ],
    gaps: [
      "No injury-specific rehab plans, no mobility assessment that scores your hip/knee/ankle/balance, and no AI personalization — everyone follows the same daily video.",
      "Nearly double LegLike's Pro price for mobility content alone, with no strength programming or rehab track included.",
      "Not built for someone recovering from an injury, just for general flexibility maintenance.",
    ],
    verdict:
      "A good daily mobility habit-builder if you just want to follow along with video and don't need personalization or rehab. LegLike costs less and adapts the plan to an actual assessment and, when needed, a phased rehab program.",
    pickThemIf:
      "You want a set-and-forget daily stretching video routine and don't need it personalized to an assessment or an injury.",
    faqs: [
      {
        q: "Is LegLike a mobility app like Pliability?",
        a: "Mobility is one part of LegLike, alongside AI workout generation and rehab plans, and it's built around your own assessment rather than one video routine for everyone. Pliability is deeper on daily-video mobility content alone, at close to double the price.",
      },
    ],
  },
  {
    slug: "fitbod",
    name: "Fitbod",
    short: "Fitbod",
    positioning:
      "General AI-personalized workout app that builds full-body strength training plans based on your equipment, goals and workout history.",
    pricingModel: "per-user",
    pricingSummary:
      "Published at $15.99/month, or $95.99/year (about $8/month), with a limited free tier of 3 workouts.",
    pricingSource: "https://fitbod.me/faqs/",
    pricingChecked: "2026-09-15",
    exampleCostMonthly: "$15.99/month (or $8/month billed annually)",
    whereTheyWin: [
      "Full-body programming across every muscle group, not just the lower body — a better fit if legs are one part of a broader training goal.",
      "Large exercise database and years of usage data behind its recommendation engine.",
      "Simple gym-log workflow that a lot of lifters already know.",
    ],
    gaps: [
      "No mobility assessment, no rehab-specific phased programming, and no injury-recovery track — it's a general lifting app, not built for coming back from an injury.",
      "The free tier is capped at 3 workouts total, not a recurring monthly allowance.",
      "More expensive month-to-month than LegLike's Pro plan for anyone whose actual goal is lower-body strength or rehab rather than full-body lifting.",
    ],
    verdict:
      "The better pick for general full-body strength training with no injury concerns. LegLike is the better pick when the goal is specifically lower-body performance or recovering from a hip, knee or ankle issue.",
    pickThemIf:
      "You want general full-body gym programming and have no rehab or lower-body-specific need.",
    faqs: [
      {
        q: "Why choose LegLike over Fitbod for leg training?",
        a: "Fitbod programs the whole body; LegLike is built specifically around lower-body strength, mobility and rehab, including a hip/knee/ankle/balance assessment and phased injury-recovery plans that Fitbod doesn't offer.",
      },
    ],
  },
  {
    slug: "caliber",
    name: "Caliber",
    short: "Caliber",
    positioning:
      "Strength and nutrition coaching app with a free self-guided tier and a paid human-coaching upgrade path.",
    pricingModel: "per-user",
    pricingSummary:
      "A free tier with a substantial feature set, a Pro coaching tier reported around $19/month for group coaching, and 1:1 Premium human coaching reported from $200–$1,400/month depending on the package.",
    pricingSource: "https://www.garagegymreviews.com/caliber-app-review",
    pricingChecked: "2026-09-15",
    exampleCostMonthly: "Free tier available; Pro ~$19/month; 1:1 coaching $200+/month",
    whereTheyWin: [
      "A genuine path to a real human coach for people who want live accountability, not just software.",
      "Nutrition coaching is bundled in alongside training, which LegLike doesn't offer.",
      "A generous free tier for general strength and nutrition tracking.",
    ],
    gaps: [
      "No lower-body-specific mobility assessment or injury-rehab phasing — it's general strength and nutrition coaching, not built around recovery.",
      "The human-coaching tiers that make Caliber distinctive cost far more than LegLike's entire product ($200+/month vs. LegLike's $16 Clinic plan).",
      "Coaching quality depends on which human coach you're matched with, which varies more than a consistent AI-generated program.",
    ],
    verdict:
      "Worth it if you specifically want a human strength and nutrition coach and are willing to pay for it. For lower-body-specific programming and rehab at a fixed low price with no coach matching involved, LegLike is the cheaper, narrower tool built for that job.",
    pickThemIf:
      "You want nutrition coaching bundled with training and are open to paying significantly more for a human coach.",
    faqs: [
      {
        q: "Is LegLike a replacement for a human coach like Caliber offers?",
        a: "No — LegLike is AI-programmed, not human-coached. If you specifically want a 1:1 human coach and nutrition guidance, Caliber's paid coaching tiers do that, at a materially higher price than LegLike's plans.",
      },
    ],
  },
];
