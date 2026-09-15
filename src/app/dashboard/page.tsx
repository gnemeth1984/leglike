import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard-shell";
import { GenerateWorkoutButton } from "@/components/generate-workout-button";

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const [profile, latestAssessment, workoutPlans, rehabPlans] = await Promise.all([
    prisma.onboardingProfile.findUnique({ where: { userId } }),
    prisma.mobilityAssessment.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.workoutPlan.findMany({
      where: { userId },
      include: { exercises: { include: { exercise: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.rehabPlan.findMany({
      where: { userId },
      include: { exercises: { include: { exercise: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back{profile?.primaryGoal ? "," : ""} {session?.user?.name}
            </h1>
            <p className="text-sm text-neutral-400">
              {profile?.primaryGoal ? `Goal: ${profile.primaryGoal}` : "Complete your onboarding to personalize plans."}
            </p>
          </div>
          <GenerateWorkoutButton goal={profile?.primaryGoal || "General fitness"} equipment={profile?.equipment || []} painAreas={profile?.painAreas || []} />
        </div>

        <div className="mb-10 grid gap-6 sm:grid-cols-3">
          <Card>
            <div className="text-sm text-neutral-400">Mobility score</div>
            <div className="mt-2 text-3xl font-bold text-lime-400">
              {latestAssessment?.overallScore ?? "—"}
            </div>
            <Link href="/assessment" className="mt-3 inline-block text-xs text-neutral-500 hover:text-lime-400">
              Retake assessment →
            </Link>
          </Card>
          <Card>
            <div className="text-sm text-neutral-400">Workout plans</div>
            <div className="mt-2 text-3xl font-bold text-white">{workoutPlans.length}</div>
            <span className="mt-3 inline-block text-xs text-neutral-500">AI-generated sessions</span>
          </Card>
          <Card>
            <div className="text-sm text-neutral-400">Rehab plans</div>
            <div className="mt-2 text-3xl font-bold text-white">{rehabPlans.length}</div>
            <Link href="/rehab" className="mt-3 inline-block text-xs text-neutral-500 hover:text-lime-400">
              Manage rehab →
            </Link>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">Recent workout plans</h2>
            <div className="space-y-4">
              {workoutPlans.length === 0 && (
                <Card>
                  <p className="text-sm text-neutral-400">
                    No workout plans yet — generate your first AI plan above.
                  </p>
                </Card>
              )}
              {workoutPlans.map((plan) => (
                <Card key={plan.id}>
                  <h3 className="mb-2 font-semibold text-white">{plan.title}</h3>
                  <ul className="space-y-1 text-sm text-neutral-400">
                    {plan.exercises.map((ex) => (
                      <li key={ex.id}>
                        {ex.exercise.name} — {ex.sets} × {ex.reps}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">Rehab plans</h2>
            <div className="space-y-4">
              {rehabPlans.length === 0 && (
                <Card>
                  <p className="mb-3 text-sm text-neutral-400">No rehab plans yet.</p>
                  <Link href="/rehab">
                    <Button size="sm" variant="outline">Create rehab plan</Button>
                  </Link>
                </Card>
              )}
              {rehabPlans.map((plan) => (
                <Card key={plan.id}>
                  <h3 className="mb-2 font-semibold text-white">{plan.title}</h3>
                  <p className="mb-2 text-xs text-neutral-500">
                    Phase {plan.phase} of {plan.totalPhases} — {plan.region.replace("_", " ")}
                  </p>
                  <ul className="space-y-1 text-sm text-neutral-400">
                    {plan.exercises.map((ex) => (
                      <li key={ex.id}>
                        {ex.exercise.name} — {ex.sets} × {ex.reps}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
