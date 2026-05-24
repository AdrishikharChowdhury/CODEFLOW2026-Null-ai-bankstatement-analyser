"use client";

import Image from "next/image";

interface Order {
  id: string;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  amount: string;
  status: "completed" | "pending" | "cancelled";
  date: string;
}

const orders: Order[] = [
  {
    id: "ORD-001",
    user: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "/ac.jpeg",
    },
    amount: "$1,234.00",
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "/sm.jpeg",
    },
    amount: "$856.00",
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "ORD-003",
    user: {
      name: "Mike Johnson",
      email: "mike@example.com",
      avatar: "/arjunm.jpeg",
    },
    amount: "$2,145.00",
    status: "completed",
    date: "2024-01-13",
  },
  {
    id: "ORD-004",
    user: {
      name: "Sarah Williams",
      email: "sarah@example.com",
      avatar: "/tanishag.jpeg",
    },
    amount: "$432.00",
    status: "cancelled",
    date: "2024-01-12",
  },
];

export function LastOrders() {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-foreground mb-4">Last Orders</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order ID</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={order.user.avatar}
                      alt={order.user.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.user.name}</p>
                      <p className="text-xs text-gray-500">{order.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">{order.id}</td>
                <td className="py-4 px-4 text-sm font-semibold text-gray-900">{order.amount}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
