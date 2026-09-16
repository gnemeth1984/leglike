import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  jsonLdProps,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/lib/seo/structured-data";

const features = [
  {
    title: "AI Workout Generator",
    desc: "Tell us your goal and equipment — GPT-4o-mini builds a lower-body strength session tuned to you in seconds.",
    icon: "⚡",
  },
  {
    title: "Mobility Assessment",
    desc: "A guided hip, knee, ankle and balance screen scores your movement and flags where to focus first.",
    icon: "🧭",
  },
  {
    title: "Rehab Plans",
    desc: "Phased recovery programs for common injuries — built to progress safely from pain-free to full load.",
    icon: "🩹",
  },
  {
    title: "Exercise Library",
    desc: "50+ coached lower-body movements across strength, mobility, balance and rehab, with clear instructions.",
    icon: "📚",
  },
  {
    title: "Track Every Session",
    desc: "Log sets, reps and completion. Watch your mobility score and strength trend improve week over week.",
    icon: "📈",
  },
  {
    title: "Built for Real Life",
    desc: "Home, gym or clinic — pick your equipment and LegLike adapts the plan around it.",
    icon: "🏠",
  },
];

const steps = [
  { n: "01", title: "Tell us about you", desc: "Age, goals, pain areas, equipment and training days." },
  { n: "02", title: "Get assessed", desc: "A short mobility screen scores hips, knees, ankles and balance." },
  { n: "03", title: "Train with AI plans", desc: "Personalized strength, mobility or rehab sessions, every week." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <script
        {...jsonLdProps([
          organizationSchema(),
          websiteSchema(),
          softwareApplicationSchema(),
        ])}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(600px circle at 20% 0%, rgba(190,242,100,0.15), transparent 60%), radial-gradient(500px circle at 90% 20%, rgba(190,242,100,0.08), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
          <div className="animate-fade-up mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-1.5 text-xs text-neutral-400">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400" /> AI-powered lower-body training
          </div>
          <h1 className="animate-fade-up text-4xl font-bold leading-tight text-white sm:text-6xl" style={{ animationDelay: "80ms" }}>
            Stronger legs.
            <br />
            <span className="text-lime-400">Better movement.</span> Less pain.
          </h1>
          <p
            className="animate-fade-up mx-auto mt-6 max-w-xl text-lg text-neutral-400"
            style={{ animationDelay: "160ms" }}
          >
            LegLike builds personalized lower-body strength, mobility and rehab
            programs with AI — whether you&apos;re training for performance or
            recovering from injury.
          </p>
          <div className="animate-fade-up mt-10 flex items-center justify-center gap-4" style={{ animationDelay: "240ms" }}>
            <Link href="/auth/signup">
              <Button size="lg">Start free assessment</Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                See pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Everything for lower-body training</h2>
          <p className="mt-3 text-neutral-400">Strength, mobility and rehab — in one AI-guided plan.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="hover:border-lime-400/40 transition-colors">
              <div className="mb-4 text-3xl">{f.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-neutral-400">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-neutral-800/60 bg-neutral-900/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">How LegLike works</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <div className="mb-4 text-4xl font-bold text-lime-400/80">{s.n}</div>
                <h3 className="mb-2 text-lg font-semibold text-white">{s.title}</h3>
                <p className="text-sm text-neutral-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to train smarter?</h2>
        <p className="mt-4 text-neutral-400">
          Free to start. No card required. Get your first AI plan in minutes.
        </p>
        <div className="mt-8">
          <Link href="/auth/signup">
            <Button size="lg">Get started free</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
