"use client";

export function WeeklyChart() {
  const data = [
    { day: "Mon", value: 65 },
    { day: "Tue", value: 85 },
    { day: "Wed", value: 45 },
    { day: "Thu", value: 95 },
    { day: "Fri", value: 75 },
    { day: "Sat", value: 55 },
    { day: "Sun", value: 40 },
  ];

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Weekly Statistics</h3>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option>This Week</option>
          <option>Last Week</option>
          <option>This Month</option>
        </select>
      </div>
      
      <div className="flex items-end justify-between gap-4 h-64">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          
          return (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-3">
              <div className="w-full flex items-end justify-center" style={{ height: "100%" }}>
                <div
                  className="w-full rounded-full bg-[#3A3A3A] transition-all duration-500 hover:opacity-80 cursor-pointer shadow-sm"
                  style={{ height: `${height}%` }}
                  title={`${item.day}: ${item.value}%`}
                />
              </div>
              <span className="text-sm font-medium text-gray-600">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
