"use client";
import { useEffect } from "react";

export default function HistoryLoading() {
  useEffect(() => { import("@aejkatappaja/phantom-ui"); }, []);

  return (
    <div className="max-w-400 mx-auto flex flex-col gap-8">
      <phantom-ui loading>
        <h1 className="text-3xl font-bold text-foreground mb-2">Transaction History</h1>
        <p className="text-muted-foreground mb-8">Detailed Transaction Analysis</p>

        {/* AI Category skeleton */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <p className="text-xl font-semibold mb-4 text-foreground">AI Category of Expenses</p>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between py-3">
                <span className="text-muted-foreground w-8">{i + 1}</span>
                <span className="text-foreground flex-1 ml-4">Category Name</span>
                <span className="text-foreground text-right w-24">₹XX,XXX</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recurring Payments skeleton */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <p className="text-xl font-semibold mb-4 text-foreground">Recurring Payments</p>
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between py-3">
                <span className="text-muted-foreground w-8">{i + 1}</span>
                <span className="text-foreground flex-[2] ml-4">Merchant Name</span>
                <span className="text-foreground flex-1 text-center">3 occurrences</span>
                <span className="text-foreground text-right w-24">₹XX,XXX</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History skeleton */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <p className="text-xl font-semibold mb-4 text-foreground">Transaction History</p>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between py-3">
                <span className="text-foreground w-28">01 Jan 2026</span>
                <span className="text-foreground w-24">₹XX,XXX</span>
                <span className="text-foreground w-24">₹XX,XXX</span>
                <span className="text-foreground flex-1 ml-4">Description text here</span>
                <span className="text-foreground text-right w-24">₹XX,XXX</span>
              </div>
            ))}
          </div>
        </div>
      </phantom-ui>
    </div>
  );
}
