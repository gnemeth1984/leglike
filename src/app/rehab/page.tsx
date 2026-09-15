import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard-shell";
import { GenerateRehabForm } from "@/components/generate-rehab-form";

export default async function RehabPage() {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const plans = await prisma.rehabPlan.findMany({
    where: { userId },
    include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-8 text-2xl font-bold text-white">Rehab Plans</h1>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <GenerateRehabForm />
          </div>
          <div className="lg:col-span-2 space-y-4">
            {plans.length === 0 && (
              <Card>
                <p className="text-sm text-neutral-400">
                  No rehab plans yet — generate one from the form.
                </p>
              </Card>
            )}
            {plans.map((plan) => (
              <Card key={plan.id}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-white">{plan.title}</h3>
                  <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                    Phase {plan.phase}/{plan.totalPhases}
                  </span>
                </div>
                <p className="mb-3 text-xs text-neutral-500">
                  {plan.region.replace("_", " ")} — {plan.condition}
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
    </DashboardShell>
  );
}
