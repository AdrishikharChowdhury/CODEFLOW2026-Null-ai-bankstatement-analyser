import { Sidebar } from "@/components/Sidebar";
import { StatementCharts } from "@/components/application/charts/statement-charts";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSummaries } from "@/lib/actions/statements.action";
import { SelectStatementAnalytical } from "@/components/SelectStatementAnalytical";

export default async function AnalyticsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const summaries=await getSummaries(user.id);

  // Mock data for demonstration - replace with actual data fetching
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
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="max-w-400 mx-auto flex flex-col">
          <h1 className="text-3xl font-bold text-foreground mb-2">Anaytics</h1>
          <p className="text-muted-foreground mb-8">
            Detailed Transaction Analysis
          </p>
          <div className="py-6 self-end">
            <SelectStatementAnalytical summaries={summaries} />
          </div>
          <StatementCharts
            categoryExpense={mockData.category_expense}
            transactions={mockData.transactions}
            recurringPayments={mockData.recurring_payments}
            healthScore={mockData.health_score}
          />
        </div>
      </div>
    </div>
  );
}
