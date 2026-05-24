"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  bgColor: string;
}

export function MetricCard({ title, value, change, trend, bgColor }: MetricCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  
  return (
    <div className={`rounded-2xl p-6 ${bgColor} shadow-sm border border-gray-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          <div className="flex items-center gap-1 mt-2">
            <TrendIcon className={`h-4 w-4 ${trend === "up" ? "text-green-600" : "text-red-600"}`} />
            <span className={`text-sm font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {change}
            </span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        </div>
        <div className="w-16 h-16">
          <svg viewBox="0 0 60 30" className="w-full h-full">
            <polyline
              points="0,20 10,15 20,18 30,10 40,12 50,5 60,8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={trend === "up" ? "text-green-500" : "text-red-500"}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Total Income"
        value="$45,231"
        change="+12.5%"
        trend="up"
        bgColor="bg-[#D0DBD0]"
      />
      <MetricCard
        title="Total Expenses"
        value="$12,426"
        change="+8.2%"
        trend="up"
        bgColor="bg-[#F5DF9E]"
      />
      <MetricCard
        title="Health Score"
        value="Strong"
        change="+3.1%"
        trend="up"
        bgColor="bg-[#A4A7FC]"
      />
    </div>
  );
}
