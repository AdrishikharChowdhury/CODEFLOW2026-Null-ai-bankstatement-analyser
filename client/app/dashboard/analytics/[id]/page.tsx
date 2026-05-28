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
import { getSummary, saveAdvice } from "@/lib/actions/statements.action";
import { getBudget } from "@/lib/actions/users.action";
import { generateStory } from "@/lib/actions/insights.action";
import { getPostHogClient } from "@/lib/posthog-server";
import { formatTimestamp } from "@/utils/format";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { StatementCharts } from "@/components/application/charts/statement-charts";
import { BudgetMetricCards } from "@/components/application/charts/budget-metric-cards";
import type { SummaryData } from "@/types";
import { getSummaries } from "@/lib/actions/statements.action";
import { SelectStatement } from "@/components/SelectStatement";

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

  const { summary, created_at, ai_advice, fraud_detection } = await getSummary(user.id, id);
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

  let story = ai_advice ?? "";
  let fraudAlerts: string[] = [];
  if (fraud_detection) {
    try { fraudAlerts = JSON.parse(fraud_detection); } catch { fraudAlerts = []; }
  }

  if (!ai_advice) {
    try {
      const result = await generateStory(summary as SummaryData);
      story = result.story;
      fraudAlerts = result.fraud_alerts;
      await saveAdvice(id, story, JSON.stringify(fraudAlerts));
    } catch (e) {
      console.error("Story generation failed:", e);
    }
  }

  const totalExpense = summary.health_score?.total_expense ?? 0;

  return (
    <div className="max-w-400 mx-auto flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Financial Analytics Overview
              </p>
            </div>
            <SelectStatement url='/dashboard/analytics' summaries={summaries} />
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <h1 className="text-xl md:text-2xl font-semibold text-foreground">Statement Summary</h1>
              <p className="text-sm md:text-lg text-muted-foreground">
                <span className="font-extrabold">Created At: </span>
                {formatTimestamp(created_at)}
              </p>
            </div>
            {budget && (
            <BudgetMetricCards budget={budget} totalExpense={totalExpense} />
          )}
            <StatementCharts
              categoryExpense={category_expense}
              transactions={transactions}
              recurringPayments={recurring_payments}
              healthScore={summary.health_score}
            />
            
            <div className="flex flex-col gap-4">
              <h2 className="text-lg md:text-xl font-semibold text-foreground">Recomendations:</h2>
              <ul className="flex flex-col gap-4 list-disc ml-4 text-sm md:text-base text-foreground">
                {recommendations.map((recommendation, idx: number) => (
                  <li key={idx} className="leading-relaxed">{recommendation}</li>
                ))}
              </ul>
              <div className="flex flex-col gap-4">
                <h2 className="text-lg md:text-xl font-semibold text-foreground">AI Advice: </h2>
                {story && (
                  <div className="bg-card border border-border rounded-lg p-4 md:p-6 text-foreground leading-relaxed text-sm md:text-base">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{story}</ReactMarkdown>
                  </div>
                )}
                {fraudAlerts.length > 0 ? (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 md:p-6">
                    {fraudAlerts.map((a, i) => (
                      <p key={i} className="text-red-600 dark:text-red-400 font-medium text-sm md:text-base">{a}</p>
                    ))}
                  </div>
                ) : (
                  <p className="bg-card border border-border rounded-lg p-4 md:p-6 whitespace-pre-line text-muted-foreground leading-relaxed text-sm md:text-base">
                    Good News No Fraud has been detected
                  </p>
                )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
