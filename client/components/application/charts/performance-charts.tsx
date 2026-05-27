"use client";

import { ScatterChart } from "@mui/x-charts/ScatterChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useTheme } from "@/components/ThemeProvider";

interface StatementSummary {
  id: string;
  created_at: string;
  summary: {
    health_score: {
      total_income: number;
      total_expense: number;
      net_savings: number;
      savings_rate: number;
      expense_ratio: number;
      avg_expense: number;
      health_label: string;
    };
  };
}

interface PerformanceChartsProps {
  summaries: StatementSummary[];
}

const labelColor: Record<string, string> = {
  Strong: "bg-green-500",
  Stable: "bg-blue-500",
  Watch: "bg-amber-500",
  Critical: "bg-red-500",
};

const labelTextColor: Record<string, string> = {
  Strong: "text-green-700 dark:text-green-300",
  Stable: "text-blue-700 dark:text-blue-300",
  Watch: "text-amber-700 dark:text-amber-300",
  Critical: "text-red-700 dark:text-red-300",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export function PerformanceCharts({ summaries }: PerformanceChartsProps) {
  const { theme } = useTheme();

  const muiTheme = createTheme({
    palette: { mode: theme === "dark" ? "dark" : "light" },
  });

  const sorted = [...summaries].reverse();

  const avgSavingsRate =
    summaries.length > 0
      ? summaries.reduce((sum, s) => sum + s.summary.health_score.savings_rate, 0) /
        summaries.length
      : 0;

  const totalIncome = summaries.reduce(
    (sum, s) => sum + s.summary.health_score.total_income,
    0
  );
  const totalExpense = summaries.reduce(
    (sum, s) => sum + s.summary.health_score.total_expense,
    0
  );

  const bestLabel = summaries.length > 0
    ? summaries.reduce((best, s) => {
        const order = ["Critical", "Watch", "Stable", "Strong"];
        return order.indexOf(s.summary.health_score.health_label) >
          order.indexOf(best)
          ? s.summary.health_score.health_label
          : best;
      }, "Critical" as string)
    : "N/A";

  if (summaries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No statements yet. Upload a statement to see performance.
      </div>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="space-y-8">
        {/* Summary metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">
              Avg Savings Rate
            </p>
            <p className={`text-2xl font-bold ${avgSavingsRate >= 20 ? "text-green-500" : "text-red-500"}`}>
              {avgSavingsRate.toFixed(1)}%
            </p>
            <div className="mt-2">
              <SparkLineChart
                data={sorted.map((s) => s.summary.health_score.savings_rate)}
                area
                height={40}
                showHighlight
                showTooltip
                color={avgSavingsRate >= 20 ? "#22c55e" : "#ef4444"}
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">
              Total Income
            </p>
            <p className="text-2xl font-bold text-foreground">
              ₹{totalIncome.toLocaleString("en-IN")}
            </p>
            <div className="mt-2">
              <SparkLineChart
                data={sorted.map((s) => s.summary.health_score.total_income)}
                area
                height={40}
                showHighlight
                showTooltip
                color="#3b82f6"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">
              Total Expenses
            </p>
            <p className="text-2xl font-bold text-red-400">
              ₹{totalExpense.toLocaleString("en-IN")}
            </p>
            <div className="mt-2">
              <SparkLineChart
                data={sorted.map((s) => s.summary.health_score.total_expense)}
                area
                height={40}
                showHighlight
                showTooltip
                color="#f87171"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">
              Best Health
            </p>
            <p
              className={`text-2xl font-bold ${labelTextColor[bestLabel] || "text-foreground"}`}
            >
              {bestLabel}
            </p>
            <div className="mt-2">
              <SparkLineChart
                data={sorted.map((s) =>
                  ["Critical", "Watch", "Stable", "Strong"].indexOf(
                    s.summary.health_score.health_label
                  )
                )}
                area
                height={40}
                showHighlight
                showTooltip
                color={bestLabel === "Strong" ? "#22c55e" : "#f59e0b"}
              />
            </div>
          </div>
        </div>

        {/* Savings Rate Trend */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Savings Rate Trend
          </h3>
          {sorted.length >= 2 ? (
            <LineChart
              xAxis={[
                {
                  data: sorted.map((s) => new Date(s.created_at)),
                  scaleType: "time",
                  valueFormatter: (d: Date) =>
                    d.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    }),
                },
              ]}
              series={[
                {
                  data: sorted.map((s) => s.summary.health_score.savings_rate),
                  label: "Savings Rate (%)",
                  area: true,
                  color: "#22c55e",
                  showMark: true,
                },
              ]}
              height={300}
            />
          ) : (
            <p className="text-muted-foreground">
              Upload more statements to see your savings rate trend.
            </p>
          )}
        </div>

        {/* Income vs Expense Scatter */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Income vs Expense
          </h3>
          {sorted.length >= 2 ? (
            <ScatterChart
              series={[
                {
                  label: "Statements",
                  data: sorted.map((s) => ({
                    x: s.summary.health_score.total_income,
                    y: s.summary.health_score.total_expense,
                    id: s.id,
                  })),
                  valueFormatter: (v) => {
                    if (!v) return "";
                    const { x, y } = v as { x: number; y: number };
                    return `Income: ₹${x.toLocaleString("en-IN")}\nExpense: ₹${y.toLocaleString("en-IN")}`;
                  },
                },
              ]}
              height={300}
            />
          ) : (
            <p className="text-muted-foreground">
              Upload more statements to see income vs expense comparison.
            </p>
          )}
        </div>

        {/* Health Label Timeline */}
        {sorted.length >= 1 && (
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Health Timeline
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {sorted.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-xs">{formatDate(s.created_at)}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                      labelColor[
                        s.summary.health_score.health_label as keyof typeof labelColor
                      ] || "bg-gray-500"
                    }`}
                  >
                    {s.summary.health_score.health_label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
