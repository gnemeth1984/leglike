import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const { region, condition } = await req.json();

  const exercises = await prisma.exercise.findMany({
    where: { region, type: { in: ["REHAB", "MOBILITY", "STRETCH"] } },
    select: { id: true, name: true, type: true, difficulty: true },
  });

  const exerciseList = exercises.map((e) => `${e.id}: ${e.name} (${e.type}, ${e.difficulty})`).join("\n");

  let plan;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You are a physiotherapist assistant building a phase-1 (early, pain-free) rehab plan. Choose 4-6 exercises from the provided list (exact ids) appropriate for early-phase rehab of this condition. Respond ONLY with JSON: {"title": string, "exerciseIds": string[]}.',
        },
        {
          role: "user",
          content: `Body region: ${region}\nCondition: ${condition}\n\nAvailable exercises:\n${exerciseList}`,
        },
      ],
    });
    plan = JSON.parse(completion.choices[0].message.content || "{}");
  } catch (err) {
    console.error("OpenAI error", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }

  const chosenIds: string[] = (plan.exerciseIds || []).filter((id: string) =>
    exercises.some((e) => e.id === id)
  );

  if (chosenIds.length === 0) {
    return NextResponse.json({ error: "No matching exercises found for this region" }, { status: 400 });
  }

  const rehabPlan = await prisma.rehabPlan.create({
    data: {
      userId,
      title: plan.title || `${region} Rehab Plan`,
      region,
      condition,
      phase: 1,
      totalPhases: 3,
      aiGenerated: true,
      exercises: {
        create: chosenIds.map((exerciseId, i) => ({
          exerciseId,
          order: i,
          sets: 2,
          reps: "10",
        })),
      },
    },
    include: { exercises: { include: { exercise: true } } },
  });

  return NextResponse.json(rehabPlan);
}
