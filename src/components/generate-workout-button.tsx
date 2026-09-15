"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function GenerateWorkoutButton({
  goal,
  equipment,
  painAreas,
}: {
  goal: string;
  equipment: string[];
  painAreas: string[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/ai/generate-workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, equipment, painAreas, difficulty: "beginner" }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to generate workout");
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={generate} disabled={loading}>
        {loading ? "Generating..." : "✨ Generate AI workout"}
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
