import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");
  const type = searchParams.get("type");

  const exercises = await prisma.exercise.findMany({
    where: {
      ...(region ? { region: region as any } : {}),
      ...(type ? { type: type as any } : {}),
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(exercises);
}
