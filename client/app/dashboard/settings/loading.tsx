"use client";
import { useEffect } from "react";

export default function SettingsLoading() {
  useEffect(() => { import("@aejkatappaja/phantom-ui"); }, []);

  return (
    <div className="flex justify-center items-center min-h-full">
      <div className="max-w-md mx-auto flex flex-col items-center">
        <phantom-ui loading>
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground mb-8">Set your daily, weekly, monthly &amp; yearly budget limits</p>

          <div className="bg-card rounded-xl border border-border shadow-sm w-full">
            <div className="p-6 border-b border-border">
              <p className="text-lg font-semibold text-foreground">Budget Limits</p>
              <p className="text-sm text-muted-foreground">Define your spending caps to track expenses against.</p>
            </div>
            <div className="p-6 space-y-6">
              {["Daily", "Weekly", "Monthly", "Yearly"].map((label) => (
                <div key={label}>
                  <p className="text-sm text-muted-foreground mb-2">Set {label} Budget (₹)</p>
                  <div className="flex items-center border border-border rounded-lg p-3">
                    <span className="text-muted-foreground mr-2">₹</span>
                    <span className="text-foreground">XX,XXX</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-4">
              <span className="px-4 py-2 bg-muted text-muted-foreground rounded-lg">Reset</span>
              <span className="px-4 py-2 bg-muted text-muted-foreground rounded-lg">Save Budget</span>
            </div>
          </div>
        </phantom-ui>
      </div>
    </div>
  );
}
