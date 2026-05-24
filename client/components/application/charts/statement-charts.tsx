"use client";

import { PieChart, LineChart, BarChart } from "@mui/x-charts";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import type { CategoryExpense, Transaction, RecurringPayment } from "@/types";

interface StatementChartsProps {
  categoryExpense: CategoryExpense[];
  transactions: Transaction[];
  recurringPayments: RecurringPayment[];
  healthScore: {
    total_income: number;
    total_expense: number;
    net_savings: number;
    savings_rate: number;
    health_label: string;
  };
}

export function StatementCharts({
  categoryExpense,
  transactions,
  recurringPayments,
  healthScore,
}: StatementChartsProps) {
  return (
      <div className="flex flex-col gap-6">
        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Income"
            value={`₹${healthScore.total_income.toLocaleString()}`}
            color="text-green-pea-100"
          />
          <MetricCard
            label="Total Expenses"
            value={`₹${healthScore.total_expense.toLocaleString()}`}
            color="text-red-400"
          />
          <MetricCard
            label="Net Savings"
            value={`₹${healthScore.net_savings.toLocaleString()}`}
            color={healthScore.net_savings >= 0 ? "text-green-pea-100" : "text-red-400"}
          />
          <MetricCard
            label="Savings Rate"
            value={`${healthScore.savings_rate.toFixed(1)}%`}
            color={
              healthScore.health_label === "Strong"
                ? "text-green-pea-100"
                : healthScore.health_label === "Critical"
                ? "text-red-400"
                : "text-amber-400"
            }
          />
        </div>

        {/* Chart row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut: Expense categories */}
          <div className="bg-green-pea-1900 border border-green-pea-400 rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-green-pea-50">
              Expense Categories
            </h3>
            {categoryExpense.length > 0 ? (
              <PieChart
                series={[
                  {
                    data: categoryExpense.map((c) => ({
                      id: c.ai_category,
                      label: c.ai_category,
                      value: c.debit_value,
                    })),
                    innerRadius: 60,
                    outerRadius: 120,
                    paddingAngle: 2,
                    cornerRadius: 4,
                  },
                ]}
                width={400}
                height={300}
                slotProps={{
                  legend: {
                    direction: "vertical",
                    position: { vertical: "middle", horizontal: "end" },
                  },
                }}
              />
            ) : (
              <p className="text-green-pea-200">No expense data available</p>
            )}
          </div>

          {/* Line chart: Balance trend */}
          <div className="bg-green-pea-1900 border border-green-pea-400 rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-green-pea-50">
              Balance Trend
            </h3>
            {transactions.length > 0 ? (
              <LineChart
                xAxis={[
                  {
                    data: transactions.map((_, i) => i),
                    label: "Transaction #",
                  },
                ]}
                series={[
                  {
                    data: transactions.map((t) => t.balance),
                    label: "Balance",
                    color: "#818cf8",
                  },
                ]}
                width={400}
                height={300}
              />
            ) : (
              <p className="text-green-pea-200">No transaction data available</p>
            )}
          </div>
        </div>

        {/* Bar chart: Top recurring payments */}
        {recurringPayments.length > 0 && (
          <div className="bg-green-pea-1900 border border-green-pea-400 rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-green-pea-50">
              Top Recurring Payments
            </h3>
            <BarChart
              xAxis={[
                {
                  data: recurringPayments.slice(0, 8).map((p) => p.merchant),
                  scaleType: "band",
                },
              ]}
              series={[
                {
                  data: recurringPayments.slice(0, 8).map((p) => p.total_amount),
                  label: "Total (₹)",
                  color: "#34d399",
                },
              ]}
              width={800}
              height={300}
            />
          </div>
        )}
      </div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-green-pea-1900 border border-green-pea-400 rounded-xl p-4 shadow-sm">
      <p className="text-sm text-green-pea-200 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
