"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";

const REGIONS = ["ALL", "HIP", "KNEE", "ANKLE", "FOOT", "GLUTE", "HAMSTRING", "QUAD", "CALF", "FULL_LEG"];
const TYPES = ["ALL", "STRENGTH", "MOBILITY", "REHAB", "BALANCE", "STRETCH"];

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [region, setRegion] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (region !== "ALL") params.set("region", region);
    if (type !== "ALL") params.set("type", type);
    setLoading(true);
    fetch(`/api/exercises?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setExercises(data))
      .finally(() => setLoading(false));
  }, [region, type]);

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="mb-2 text-3xl font-bold text-white">Exercise Library</h1>
        <p className="mb-8 text-neutral-400">
          {exercises.length} lower-body movements for strength, mobility and rehab.
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full border px-4 py-1.5 text-xs ${
                type === t
                  ? "border-lime-400 bg-lime-400/10 text-lime-400"
                  : "border-neutral-700 text-neutral-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mb-10 flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`rounded-full border px-4 py-1.5 text-xs ${
                region === r
                  ? "border-white bg-white/10 text-white"
                  : "border-neutral-800 text-neutral-500"
              }`}
            >
              {r.replace("_", " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-neutral-500">Loading exercises...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((ex) => {
              const card = (
                <Card className={ex.published ? "transition-colors hover:border-lime-400/50" : undefined}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-white">{ex.name}</h3>
                    <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                      {ex.difficulty}
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-neutral-400">{ex.description}</p>
                  <div className="flex gap-2 text-[10px] text-lime-400">
                    <span className="rounded-full border border-lime-400/30 px-2 py-0.5">{ex.type}</span>
                    <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-neutral-400">
                      {ex.region.replace("_", " ")}
                    </span>
                    {ex.published && (
                      <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-neutral-400">
                        Guide →
                      </span>
                    )}
                  </div>
                </Card>
              );
              return ex.published ? (
                <Link key={ex.id} href={`/exercises/${ex.slug}`} className="block">
                  {card}
                </Link>
              ) : (
                <div key={ex.id}>{card}</div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
