import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSummaries } from "@/lib/actions/statements.action";
import { PerformanceCharts } from "@/components/application/charts/performance-charts";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const summaries = await getSummaries(user.id);

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col justify-center min-h-[calc(100dvh-8rem)]">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm md:text-base mt-1">Detailed Spending Analysis</p>
      </div>
      <PerformanceCharts summaries={summaries} />
    </div>
  );
}
