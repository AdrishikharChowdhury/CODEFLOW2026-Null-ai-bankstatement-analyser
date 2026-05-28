"use client";

import { PieChart, LineChart, BarChart } from "@mui/x-charts";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import type { CategoryExpense, Transaction, RecurringPayment } from "@/types";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useContainerWidth } from "@/hooks/useContainerWidth";

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
  const { theme } = useTheme();
  const { ref: pieRef, width: pieWidth } = useContainerWidth<HTMLDivElement>();
  const { ref: lineRef, width: lineWidth } = useContainerWidth<HTMLDivElement>();
  const { ref: barRef, width: barWidth } = useContainerWidth<HTMLDivElement>();

  const muiTheme = createTheme({
    palette: {
      mode: theme === "dark" ? "dark" : "light",
    },
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Income"
            value={`₹${healthScore.total_income.toLocaleString("en-IN")}`}
            color="text-green-500"
          />
          <MetricCard
            label="Total Expenses"
            value={`₹${healthScore.total_expense.toLocaleString("en-IN")}`}
            color="text-red-400"
          />
          <MetricCard
            label="Net Savings"
            value={`₹${healthScore.net_savings.toLocaleString("en-IN")}`}
            color={healthScore.net_savings >= 0 ? "text-green-600" : "text-red-400"}
          />
          <MetricCard
            label="Savings Rate"
            value={`${healthScore.savings_rate.toFixed(1)}%`}
            color={healthScore.savings_rate >= 20 ? "text-green-600" : "text-red-400"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Expense Categories
            </h3>
            {categoryExpense.length > 0 ? (
              <div ref={pieRef} className="w-full">
                {pieWidth > 0 && (
                  <PieChart
                    series={[
                      {
                        data: categoryExpense.map((c) => ({
                          id: c.ai_category,
                          label: c.ai_category,
                          value: c.debit_value,
                        })),
                        innerRadius: 60,
                        outerRadius: Math.min(pieWidth / 3.5, 120),
                        paddingAngle: 2,
                        cornerRadius: 4,
                      },
                    ]}
                    width={pieWidth}
                    height={300}
                    slotProps={{
                      legend: {
                        direction: "vertical",
                        position: { vertical: "middle", horizontal: "end" },
                      },
                    }}
                  />
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No expense data available</p>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Balance Trend
            </h3>
            {transactions.length > 0 ? (
              <div ref={lineRef} className="w-full">
                {lineWidth > 0 && (
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
                    width={lineWidth}
                    height={300}
                  />
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No transaction data available</p>
            )}
          </div>
        </div>

        {recurringPayments.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Top Recurring Payments
            </h3>
            <div ref={barRef} className="w-full">
              {barWidth > 0 && (
                <BarChart
                  xAxis={[
                    {
                      data: recurringPayments.slice(0, 8).map((p) =>
                        `${p.first_seen} – ${p.last_seen}`
                      ),
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
                  width={barWidth}
                  height={300}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
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
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl md:text-2xl font-bold flex gap-2 items-center ${color}`}>{value}
        {label==="Total Income"?<TrendingUp/>:label==="Total Expenses"?<TrendingDown/>:""}
      </p>
    </div>
  );
}
