import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const body = await req.json();

  const {
    age,
    heightCm,
    weightKg,
    activityLevel,
    primaryGoal,
    painAreas,
    injuryHistory,
    equipment,
    daysPerWeek,
  } = body;

  const profile = await prisma.onboardingProfile.upsert({
    where: { userId },
    create: {
      userId,
      age,
      heightCm,
      weightKg,
      activityLevel,
      primaryGoal,
      painAreas: painAreas || [],
      injuryHistory,
      equipment: equipment || [],
      daysPerWeek,
      completed: true,
    },
    update: {
      age,
      heightCm,
      weightKg,
      activityLevel,
      primaryGoal,
      painAreas: painAreas || [],
      injuryHistory,
      equipment: equipment || [],
      daysPerWeek,
      completed: true,
    },
  });

  return NextResponse.json(profile);
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const profile = await prisma.onboardingProfile.findUnique({ where: { userId } });
  return NextResponse.json(profile);
}
