import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSummary, saveAdvice } from "@/lib/actions/statements.action";
import { getBudget } from "@/lib/actions/users.action";
import { generateStory } from "@/lib/actions/insights.action";
import { getPostHogClient } from "@/lib/posthog-server";
import type { SummaryData } from "@/types";
import { getSummaries } from "@/lib/actions/statements.action";
import { AnalyticsContent } from "@/components/AnalyticsContent";

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

  return (
    <AnalyticsContent
      id={id}
      summaries={summaries}
      created_at={created_at}
      healthScore={summary.health_score}
      totalExpense={summary.health_score?.total_expense ?? 0}
      transactions={transactions}
      categoryExpense={category_expense}
      recurringPayments={recurring_payments}
      recommendations={recommendations}
      story={story}
      fraudAlerts={fraudAlerts}
      budget={budget}
    />
  );
};

export default page;
