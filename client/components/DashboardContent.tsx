"use client";

import { PerformanceCharts } from "@/components/application/charts/performance-charts";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DashboardPdf } from "@/components/pdf/DashboardPdf";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  summaries: {
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
  }[];
}

export function DashboardContent({ summaries }: Props) {
  const { theme } = useTheme();

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col justify-center min-h-[calc(100dvh-8rem)]">
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">Detailed Spending Analysis</p>
        </div>
        {summaries.length > 0 && (
          <PdfDownloadButton pdfDoc={<DashboardPdf summaries={summaries} theme={theme} />} filename="dashboard" />
        )}
      </div>
      <PerformanceCharts summaries={summaries} />
    </div>
  );
}
