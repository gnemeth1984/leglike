"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const REGIONS = ["HIP", "KNEE", "ANKLE", "FOOT", "GLUTE", "HAMSTRING", "QUAD", "CALF"];

export function GenerateRehabForm() {
  const router = useRouter();
  const [region, setRegion] = useState("KNEE");
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/ai/generate-rehab-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ region, condition }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to generate rehab plan");
      return;
    }
    setCondition("");
    router.refresh();
  };

  return (
    <Card>
      <h2 className="mb-4 font-semibold text-white">New rehab plan</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={`rounded-full border px-3 py-1 text-xs ${
              region === r ? "border-lime-400 bg-lime-400/10 text-lime-400" : "border-neutral-700 text-neutral-400"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <Input
        placeholder="Condition (e.g. ACL recovery, patellar tendinitis)"
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
        className="mb-4"
      />
      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
      <Button onClick={generate} disabled={loading || !condition} className="w-full">
        {loading ? "Generating..." : "Generate rehab plan"}
      </Button>
    </Card>
  );
}
