import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function AdminPage() {
  const [userCount, workoutCount, rehabCount, exerciseCount, assessmentCount, users] = await Promise.all([
    prisma.user.count(),
    prisma.workoutPlan.count(),
    prisma.rehabPlan.count(),
    prisma.exercise.count(),
    prisma.mobilityAssessment.count(),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        createdAt: true,
        _count: { select: { workoutPlans: true, rehabPlans: true, assessments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const stats = [
    { label: "Total users", value: userCount },
    { label: "Workout plans", value: workoutCount },
    { label: "Rehab plans", value: rehabCount },
    { label: "Exercises", value: exerciseCount },
    { label: "Assessments", value: assessmentCount },
  ];

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-8 text-2xl font-bold text-white">Admin Panel</h1>

        <div className="mb-10 grid gap-4 sm:grid-cols-5">
          {stats.map((s) => (
            <Card key={s.label}>
              <div className="text-xs text-neutral-400">{s.label}</div>
              <div className="mt-2 text-2xl font-bold text-lime-400">{s.value}</div>
            </Card>
          ))}
        </div>

        <Card>
          <h2 className="mb-4 font-semibold text-white">Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 pr-4">Plans</th>
                  <th className="py-2 pr-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-neutral-900 text-neutral-300">
                    <td className="py-2 pr-4">{u.name}</td>
                    <td className="py-2 pr-4 text-neutral-500">{u.email}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                          u.role === "ADMIN" ? "bg-lime-400/20 text-lime-400" : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{u.plan}</td>
                    <td className="py-2 pr-4 text-neutral-500">
                      {u._count.workoutPlans + u._count.rehabPlans} plans / {u._count.assessments} assess.
                    </td>
                    <td className="py-2 pr-4 text-neutral-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
