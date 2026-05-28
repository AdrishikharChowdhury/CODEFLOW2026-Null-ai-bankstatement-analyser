import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSummaries } from "@/lib/actions/statements.action";
import { getBudget } from "@/lib/actions/users.action";
import { SelectStatement } from "@/components/SelectStatement";

export default async function AnalyticsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const [summaries] = await Promise.all([
    getSummaries(user.id),
    getBudget(),
  ]);

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center min-h-[calc(100dvh-8rem)]">
      <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
      <p className="text-muted-foreground mb-8">
        Select a statement to view detailed transaction analysis
      </p>
      <SelectStatement url='/dashboard/analytics' summaries={summaries} />
    </div>
  );
}
