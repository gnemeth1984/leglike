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
  const { hipScore, kneeScore, ankleScore, balanceScore } = body;

  const overallScore = Math.round((hipScore + kneeScore + ankleScore + balanceScore) / 4);

  let recommendation = "Your mobility looks solid — focus on progressive strength work.";
  if (overallScore < 50) {
    recommendation = "Your scores suggest starting with a rehab-focused mobility plan before heavy loading.";
  } else if (overallScore < 75) {
    recommendation = "Mix mobility work with light-to-moderate strength training this month.";
  }

  const assessment = await prisma.mobilityAssessment.create({
    data: {
      userId,
      hipScore,
      kneeScore,
      ankleScore,
      balanceScore,
      overallScore,
      recommendation,
    },
  });

  return NextResponse.json(assessment);
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const assessments = await prisma.mobilityAssessment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assessments);
}
