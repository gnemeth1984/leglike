"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const GOALS = ["Build strength", "Improve mobility", "Recover from injury", "General fitness"];
const PAIN_AREAS = ["Hip", "Knee", "Ankle", "Foot", "Hamstring", "Glute", "Quad", "Calf", "None"];
const EQUIPMENT = ["None (bodyweight)", "Resistance bands", "Dumbbells", "Barbell", "Gym access"];
const LEVELS = ["Sedentary", "Lightly active", "Active", "Athlete"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    age: "",
    heightCm: "",
    weightKg: "",
    activityLevel: "",
    primaryGoal: "",
    painAreas: [] as string[],
    injuryHistory: "",
    equipment: [] as string[],
    daysPerWeek: "3",
  });

  const toggle = (key: "painAreas" | "equipment", value: string) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));
  };

  const finish = async () => {
    setLoading(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        age: form.age ? parseInt(form.age) : null,
        heightCm: form.heightCm ? parseInt(form.heightCm) : null,
        weightKg: form.weightKg ? parseInt(form.weightKg) : null,
        daysPerWeek: parseInt(form.daysPerWeek),
      }),
    });
    router.push("/assessment");
  };

  const totalSteps = 4;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-16">
      <Card className="w-full max-w-lg">
        <div className="mb-8 flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i < step ? "bg-lime-400" : "bg-neutral-800"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Tell us about you</h2>
            <Input
              placeholder="Age"
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Height (cm)"
                type="number"
                value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
              />
              <Input
                placeholder="Weight (kg)"
                type="number"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
              />
            </div>
            <p className="text-sm text-neutral-400 mt-2">Activity level</p>
            <div className="grid grid-cols-2 gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setForm({ ...form, activityLevel: l })}
                  className={`rounded-xl border px-4 py-2 text-sm ${
                    form.activityLevel === l
                      ? "border-lime-400 bg-lime-400/10 text-lime-400"
                      : "border-neutral-700 text-neutral-300"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">What&apos;s your primary goal?</h2>
            <div className="grid gap-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => setForm({ ...form, primaryGoal: g })}
                  className={`rounded-xl border px-4 py-3 text-left text-sm ${
                    form.primaryGoal === g
                      ? "border-lime-400 bg-lime-400/10 text-lime-400"
                      : "border-neutral-700 text-neutral-300"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <Input
              placeholder="Training days per week"
              type="number"
              min={1}
              max={7}
              value={form.daysPerWeek}
              onChange={(e) => setForm({ ...form, daysPerWeek: e.target.value })}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Any pain or areas of concern?</h2>
            <div className="grid grid-cols-3 gap-2">
              {PAIN_AREAS.map((p) => (
                <button
                  key={p}
                  onClick={() => toggle("painAreas", p)}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    form.painAreas.includes(p)
                      ? "border-lime-400 bg-lime-400/10 text-lime-400"
                      : "border-neutral-700 text-neutral-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Any injury history we should know about? (optional)"
              value={form.injuryHistory}
              onChange={(e) => setForm({ ...form, injuryHistory: e.target.value })}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-500 outline-none focus:border-lime-400"
              rows={3}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">What equipment do you have?</h2>
            <div className="grid gap-2">
              {EQUIPMENT.map((e) => (
                <button
                  key={e}
                  onClick={() => toggle("equipment", e)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm ${
                    form.equipment.includes(e)
                      ? "border-lime-400 bg-lime-400/10 text-lime-400"
                      : "border-neutral-700 text-neutral-300"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button onClick={finish} disabled={loading}>
              {loading ? "Saving..." : "Finish"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
