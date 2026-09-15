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
  const { goal, equipment, painAreas, difficulty } = await req.json();

  const exercises = await prisma.exercise.findMany({
    where: equipment?.length ? { equipment: { hasSome: equipment } } : undefined,
    select: { id: true, name: true, type: true, region: true, difficulty: true },
  });

  const exerciseList = exercises
    .map((e) => `${e.id}: ${e.name} (${e.type}, ${e.region}, ${e.difficulty})`)
    .join("\n");

  let plan;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a lower-body strength and mobility coach. Choose 5-8 exercises from the provided list (use their exact ids) that best fit the user's goal, equipment, pain areas and difficulty. Respond ONLY with JSON: {\"title\": string, \"exerciseIds\": string[]}.",
        },
        {
          role: "user",
          content: `Goal: ${goal}\nEquipment available: ${equipment?.join(", ") || "none"}\nPain areas: ${painAreas?.join(", ") || "none"}\nDifficulty: ${difficulty || "beginner"}\n\nAvailable exercises:\n${exerciseList}`,
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
    return NextResponse.json({ error: "No matching exercises found" }, { status: 400 });
  }

  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      userId,
      title: plan.title || `${goal} — Lower Body Session`,
      goal,
      aiGenerated: true,
      exercises: {
        create: chosenIds.map((exerciseId, i) => ({
          exerciseId,
          order: i,
          sets: 3,
          reps: "10-12",
          restSec: 60,
        })),
      },
    },
    include: { exercises: { include: { exercise: true } } },
  });

  return NextResponse.json(workoutPlan);
}
