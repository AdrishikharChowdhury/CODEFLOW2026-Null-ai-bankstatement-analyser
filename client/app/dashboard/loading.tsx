"use client";
import { useEffect } from "react";

export default function DashboardLoading() {
  useEffect(() => { import("@aejkatappaja/phantom-ui"); }, []);

  return (
    <div className="max-w-400 mx-auto flex flex-col">
      <phantom-ui loading>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Detailed Spending Analysis</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <p className="text-sm text-muted-foreground">Metric Label</p>
              <p className="text-2xl font-bold text-foreground mt-1">₹XX,XXX</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <p className="text-lg font-semibold text-foreground mb-4">Savings Rate Trend</p>
            <div className="h-64" data-shimmer-width={500} data-shimmer-height={256}></div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <p className="text-lg font-semibold text-foreground mb-4">Income vs Expense</p>
            <div className="h-64" data-shimmer-width={500} data-shimmer-height={256}></div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <p className="text-lg font-semibold text-foreground mb-4">Health Timeline</p>
          <div className="h-48" data-shimmer-width={900} data-shimmer-height={192}></div>
        </div>
      </phantom-ui>
    </div>
  );
}
