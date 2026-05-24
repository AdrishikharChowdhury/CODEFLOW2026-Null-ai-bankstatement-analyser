"use client";

import Image from "next/image";

export function RightSidebar() {
  const categories = [
    { name: "Food & Dining", value: 35, color: "#8B5CF6" },
    { name: "Shopping", value: 25, color: "#EC4899" },
    { name: "Transportation", value: 20, color: "#F59E0B" },
    { name: "Entertainment", value: 12, color: "#10B981" },
    { name: "Others", value: 8, color: "#6B7280" },
  ];

  const recentSales = [
    { name: "John Doe", avatar: "/ac.jpeg", amount: "$234.00", time: "2h ago" },
    { name: "Jane Smith", avatar: "/sm.jpeg", amount: "$156.00", time: "4h ago" },
    { name: "Mike Johnson", avatar: "/arjunm.jpeg", amount: "$892.00", time: "6h ago" },
    { name: "Sarah Williams", avatar: "/tanishag.jpeg", amount: "$432.00", time: "8h ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Monthly Profits Donut Chart */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Profits</h3>
        
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="12"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="12"
                strokeDasharray="251.2"
                strokeDashoffset="62.8"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">75%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-600">{category.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{category.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Sales</h3>
        
        <div className="space-y-4">
          {recentSales.map((sale, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={sale.avatar}
                  alt={sale.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{sale.name}</p>
                  <p className="text-xs text-gray-500">{sale.time}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">{sale.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
