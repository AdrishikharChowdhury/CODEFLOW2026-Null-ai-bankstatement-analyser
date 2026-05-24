import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSummary } from "@/lib/actions/statements.action";
import { getBudget } from "@/lib/actions/users.action";
import { generateStory } from "@/lib/actions/insights.action";
import { getPostHogClient } from "@/lib/posthog-server";
import { BadgeIndianRupee } from "lucide-react";
import { formatRedacted, formatTimestamp } from "@/utils/format";
import { StatementCharts } from "@/components/application/charts/statement-charts";
import { BudgetMetricCards } from "@/components/application/charts/budget-metric-cards";
import type { SummaryData } from "@/types";
import { getSummaries } from "@/lib/actions/statements.action";
import { SelectStatementAnalytical } from "@/components/SelectStatementAnalytical";

interface DashboardPageProps {
  params: Promise<{ id: string }>;
}

const page = async ({ params }: DashboardPageProps) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const [{ id }, summaries, budget] = await Promise.all([
    params,
    getSummaries(user.id),
    getBudget(),
  ]);

  const { summary, created_at } = await getSummary(user.id, id);
  const {
    transactions,
    category_expense,
    recurring_payments,
    recommendations,
  } = summary;

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: user.id,
    event: "statement_viewed",
    properties: {
      statement_id: id,
      health_label: summary.health_score?.health_label ?? null,
      transaction_count: transactions.length,
    },
  });

  let story = "";
  let fraudAlerts: string[] = [];
  try {
    const result = await generateStory(summary as SummaryData);
    story = result.story;
    fraudAlerts = result.fraud_alerts;
  } catch (e) {
    console.error("Story generation failed:", e);
  }

  const totalExpense = summary.health_score?.total_expense ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="ml-64 p-8">
        <div className="max-w-400 mx-auto flex flex-col">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground mb-8">
            Financial Analytics Overview
          </p>
          <div className="py-6 self-end">
            <SelectStatementAnalytical summaries={summaries} />
          </div>

          {budget && (
            <div className="mb-6">
              <BudgetMetricCards budget={budget} totalExpense={totalExpense} />
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center gap-6">
              <h1 className="text-center">Statement Summary</h1>
              <p className="mt-4 text-lg">
                <span className="font-extrabold text-xl">Created At: </span>
                {formatTimestamp(created_at)}
              </p>
            </div>
            <StatementCharts
              categoryExpense={category_expense}
              transactions={transactions}
              recurringPayments={recurring_payments}
              healthScore={summary.health_score}
            />
            
            <div className="flex flex-col gap-4">
              <h2>Recomendations:</h2>
              <ul className="flex flex-col gap-4 list-disc ml-4">
                {recommendations.map((recommendation, idx: number) => (
                  <li key={idx}>{recommendation}</li>
                ))}
              </ul>
              <div className="flex flex-col gap-4">
                <h2>AI Advice: </h2>
                {story && (
                  <div className="bg-green-pea-1900 border border-green-pea-400 rounded-lg p-6 whitespace-pre-line text-green-pea-50 leading-relaxed">
                    {story}
                  </div>
                )}
                {fraudAlerts.length > 0 ? (
                  <div className="bg-red-900 border border-red-200 rounded-lg p-4">
                    {fraudAlerts.map((a, i) => (
                      <p key={i} className="text-red-700 font-medium">{a}</p>
                    ))}
                  </div>
                ) : (
                  <p className="bg-green-pea-1900 border border-green-pea-400 rounded-lg p-6 whitespace-pre-line text-green-pea-100 leading-relaxed">
                    Good News No Fraud has been detected
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
