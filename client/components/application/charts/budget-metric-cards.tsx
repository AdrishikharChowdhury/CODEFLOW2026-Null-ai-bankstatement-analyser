"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface BudgetData {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

interface BudgetMetricCardsProps {
  budget: BudgetData;
  totalExpense: number;
}

export function BudgetMetricCards({ budget, totalExpense }: BudgetMetricCardsProps) {
  const cards = [
    { label: "Daily Budget", budget: budget.daily, actual: budget.daily > 0 ? Math.round(totalExpense / 365) : 0 },
    { label: "Weekly Budget", budget: budget.weekly, actual: budget.weekly > 0 ? Math.round(totalExpense / 52) : 0 },
    { label: "Monthly Budget", budget: budget.monthly, actual: budget.monthly > 0 ? Math.round(totalExpense / 12) : 0 },
    { label: "Yearly Budget", budget: budget.yearly, actual: budget.yearly > 0 ? totalExpense : 0 },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const overBudget = card.actual > card.budget;
        const diff = Math.abs(card.budget-card.actual);

        return (
          <div
            key={card.label}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border flex flex-col gap-2"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <div className="flex items-center gap-2">
              {overBudget ? (
                <TrendingDown className="size-5 text-destructive shrink-0" />
              ) : (
                <TrendingUp className="size-5 text-green-600 shrink-0" />
              )}
              <span
                className={`text-xl font-bold ${
                  overBudget ? "text-destructive" : "text-green-600"
                }`}
              >
                {overBudget ? `-₹${diff.toLocaleString("en-IN")}` : `+₹${diff.toLocaleString("en-IN")}`}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Budget: ₹{card.budget.toLocaleString("en-IN")}</span>
              <span>Spent: ₹{card.actual.toLocaleString("en-IN")}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
