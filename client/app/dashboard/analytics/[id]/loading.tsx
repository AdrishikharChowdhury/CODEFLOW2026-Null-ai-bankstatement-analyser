"use client";
import { useEffect } from "react";

export default function AnalyticsLoading() {
  useEffect(() => { import("@aejkatappaja/phantom-ui"); }, []);

  return (
    <div className="max-w-400 mx-auto flex flex-col">
      <phantom-ui loading>
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground mb-8">Financial Analytics Overview</p>

        {/* Budget metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border shadow-sm">
              <p className="text-sm text-muted-foreground">Budget Label</p>
              <p className="text-xl font-bold text-foreground mt-1">₹XX,XXX</p>
            </div>
          ))}
        </div>

        {/* Statement Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <p className="text-lg font-semibold text-foreground mb-4">Category Expenses</p>
            <div className="h-64" data-shimmer-width={500} data-shimmer-height={256}></div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <p className="text-lg font-semibold text-foreground mb-4">Spending Overview</p>
            <div className="h-64" data-shimmer-width={500} data-shimmer-height={256}></div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm mb-8">
          <p className="text-lg font-semibold text-foreground mb-4">Recommendations</p>
          {Array.from({ length: 3 }).map((_, i) => (
            <p key={i} className="text-muted-foreground mb-2">Recommendation text placeholder that is long enough to span multiple lines on the page</p>
          ))}
        </div>

        {/* AI Advice */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <p className="text-lg font-semibold text-foreground mb-4">AI Advice</p>
          <p className="text-muted-foreground mb-2">AI advice paragraph content that provides financial insights and recommendations based on the analyzed statement data.</p>
          <p className="text-muted-foreground mb-2">More detailed analysis and suggestions for improving financial health and savings rate.</p>
        </div>
      </phantom-ui>
    </div>
  );
}
