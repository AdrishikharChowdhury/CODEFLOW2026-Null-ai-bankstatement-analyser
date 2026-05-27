import { StatementCharts } from "@/components/application/charts/statement-charts";
import { BudgetMetricCards } from "@/components/application/charts/budget-metric-cards";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSummaries } from "@/lib/actions/statements.action";
import { getBudget } from "@/lib/actions/users.action";
import { SelectStatementAnalytical } from "@/components/SelectStatementAnalytical";

export default async function AnalyticsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const [summaries, budget] = await Promise.all([
    getSummaries(user.id),
    getBudget(),
  ]);

  const mockData = {
    category_expense: [],
    transactions: [],
    recurring_payments: [],
    health_score: {
      total_income: 0,
      total_expense: 0,
      net_savings: 0,
      savings_rate: 0,
      health_label: "No Data",
    },
  };

  return (
    <div className="max-w-400 mx-auto flex flex-col">
      <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
      <p className="text-muted-foreground mb-8">
        Select a statement to view detailed transaction analysis
      </p>
          <div className="py-6 self-end">
            <SelectStatementAnalytical summaries={summaries} />
          </div>

          {budget && (
            <div className="mb-8">
              <BudgetMetricCards budget={budget} totalExpense={0} />
            </div>
          )}

          <StatementCharts
            categoryExpense={mockData.category_expense}
            transactions={mockData.transactions}
            recurringPayments={mockData.recurring_payments}
            healthScore={mockData.health_score}
          />
        </div>
  );
}
