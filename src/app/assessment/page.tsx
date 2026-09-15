"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TESTS = [
  {
    key: "hipScore",
    title: "Hip mobility",
    desc: "Stand and lift your knee to hip height, holding balance for 10 seconds on each side. Rate how controlled it felt.",
  },
  {
    key: "kneeScore",
    title: "Knee control",
    desc: "Perform 5 slow bodyweight squats. Rate how stable and pain-free your knees felt through the full range.",
  },
  {
    key: "ankleScore",
    title: "Ankle mobility",
    desc: "Kneel in a lunge position and drive your front knee over your toes without heel lift. Rate your range of motion.",
  },
  {
    key: "balanceScore",
    title: "Single-leg balance",
    desc: "Stand on one leg with eyes open for 30 seconds. Rate your stability without touching down.",
  },
];

export default function AssessmentPage() {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>({
    hipScore: 70,
    kneeScore: 70,
    ankleScore: 70,
    balanceScore: 70,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const submit = async () => {
    setLoading(true);
    const res = await fetch("/api/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scores),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
        <Card className="w-full max-w-lg text-center">
          <div className="mb-2 text-sm text-neutral-400">Overall mobility score</div>
          <div className="mb-4 text-6xl font-bold text-lime-400">{result.overallScore}</div>
          <p className="mb-8 text-neutral-300">{result.recommendation}</p>
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            Go to dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold text-white">Mobility Assessment</h1>
        <p className="mb-10 text-neutral-400">
          Do each movement, then rate how it felt on a scale of 0–100.
        </p>
        <div className="space-y-6">
          {TESTS.map((t) => (
            <Card key={t.key}>
              <h3 className="mb-1 font-semibold text-white">{t.title}</h3>
              <p className="mb-4 text-sm text-neutral-400">{t.desc}</p>
              <input
                type="range"
                min={0}
                max={100}
                value={scores[t.key]}
                onChange={(e) => setScores({ ...scores, [t.key]: parseInt(e.target.value) })}
                className="w-full accent-lime-400"
              />
              <div className="mt-1 text-right text-sm text-lime-400">{scores[t.key]}</div>
            </Card>
          ))}
        </div>
        <Button onClick={submit} disabled={loading} className="mt-8 w-full">
          {loading ? "Scoring..." : "Get my score"}
        </Button>
      </div>
    </div>
  );
}
