"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatementCharts } from "@/components/application/charts/statement-charts";
import { BudgetMetricCards } from "@/components/application/charts/budget-metric-cards";
import { SelectStatement } from "@/components/SelectStatement";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { AnalyticsPdf } from "@/components/pdf/AnalyticsPdf";
import { formatTimestamp } from "@/utils/format";
import { useTheme } from "@/components/ThemeProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { CategoryExpense, Transaction, RecurringPayment } from "@/types";

interface SummaryShape {
  id: string;
  created_at: string;
  slug: string | null;
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

interface Props {
  id: string;
  summaries: SummaryShape[];
  created_at: string;
  healthScore: {
    total_income: number;
    total_expense: number;
    net_savings: number;
    savings_rate: number;
    health_label: string;
  };
  totalExpense: number;
  transactions: Transaction[];
  categoryExpense: CategoryExpense[];
  recurringPayments: RecurringPayment[];
  recommendations: string[];
  story: string;
  fraudAlerts: string[];
  budget: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  } | null;
}

export function AnalyticsContent({
  id,
  summaries,
  created_at,
  healthScore,
  totalExpense,
  transactions,
  categoryExpense,
  recurringPayments,
  recommendations,
  story,
  fraudAlerts,
  budget,
}: Props) {
  const { theme } = useTheme();

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Financial Analytics Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SelectStatement url="/dashboard/analytics" summaries={summaries} />
          <PdfDownloadButton
            pdfDoc={
              <AnalyticsPdf
                created_at={created_at}
                healthScore={healthScore}
                categoryExpense={categoryExpense}
                recurringPayments={recurringPayments}
                recommendations={recommendations}
                story={story}
                fraudAlerts={fraudAlerts}
                budget={budget}
                totalExpense={totalExpense}
                theme={theme}
              />
            }
            filename={
              created_at
                ? new Date(created_at).toLocaleDateString("en-IN").replace(/\//g, "-")
                : "analytics"
            }
          />
        </div>
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
          categoryExpense={categoryExpense}
          transactions={transactions}
          recurringPayments={recurringPayments}
          healthScore={healthScore}
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
}
