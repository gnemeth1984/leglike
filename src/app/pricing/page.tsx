import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Get started with an assessment and basic library access.",
    features: ["1 mobility assessment", "Exercise library access", "1 AI workout plan / month"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/ month",
    desc: "Unlimited AI plans for serious training and recovery.",
    features: [
      "Unlimited AI workout plans",
      "Unlimited rehab plans",
      "Unlimited assessments",
      "Progress tracking & trends",
      "Priority support",
    ],
    cta: "Start Pro trial",
    highlight: true,
  },
  {
    name: "Clinic",
    price: "$99",
    period: "/ month",
    desc: "For physios and trainers managing multiple clients.",
    features: [
      "Everything in Pro",
      "Multi-client management",
      "Clinician dashboard",
      "Custom rehab protocols",
      "Dedicated onboarding",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-14 text-center">
          <h1 className="text-4xl font-bold text-white">Simple, transparent pricing</h1>
          <p className="mt-3 text-neutral-400">Start free. Upgrade when you need unlimited AI plans.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "flex flex-col",
                plan.highlight && "border-lime-400 shadow-[0_0_40px_-15px_rgba(190,242,100,0.5)]"
              )}
            >
              {plan.highlight && (
                <div className="mb-3 inline-block w-fit rounded-full bg-lime-400 px-3 py-1 text-xs font-semibold text-neutral-950">
                  Most popular
                </div>
              )}
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-neutral-500">{plan.period}</span>
              </div>
              <p className="mt-3 text-sm text-neutral-400">{plan.desc}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-neutral-300">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 text-lime-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="mt-8">
                <Button className="w-full" variant={plan.highlight ? "primary" : "outline"}>
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
