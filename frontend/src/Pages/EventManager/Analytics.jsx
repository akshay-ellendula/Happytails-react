import React from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  // Dynamic data
  const monthlyData = [
    { month: "Jan", revenue: 3200, attendance: 85 },
    { month: "Feb", revenue: 4500, attendance: 95 },
    { month: "Mar", revenue: 3800, attendance: 78 },
    { month: "Apr", revenue: 5200, attendance: 97 },
    { month: "May", revenue: 4300, attendance: 90 },
    { month: "Jun", revenue: 6000, attendance: 88 },
    { month: "Jul", revenue: 4900, attendance: 83 },
    { month: "Aug", revenue: 6100, attendance: 96 },
    { month: "Sep", revenue: 5500, attendance: 89 },
    { month: "Oct", revenue: 8900, attendance: 92 },
  ];

  const ticketSales = [
    { name: "Training", value: 45 },
    { name: "Competition", value: 25 },
    { name: "Workshop", value: 20 },
    { name: "Adoption", value: 10 },
  ];

  const COLORS = ["#A78BFA", "#60A5FA", "#34D399", "#FBBF24"];

  // Calculate platform fee (6%) and net revenue
  const platformFeeData = monthlyData.map((d) => ({
    month: d.month,
    totalRevenue: d.revenue,
    platformFee: d.revenue * 0.06,
  }));

  return (
    <>
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">Event Analytics</h1>
            <p className="text-gray-600">
              Detailed insights and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#effe8b]">
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Summary Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-6">
            Event Performance Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 border border-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Events</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">24</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">$42,580</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Platform Fee (6%)</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">$2,555</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Net Revenue</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">$40,025</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">
              Revenue Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#000"
                  strokeWidth={2}
                  dot={{ fill: "#000" }}
                  fillOpacity={0.3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Ticket Sales by Type */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">
              Ticket Sales by Event Type
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ticketSales}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  label
                >
                  {ticketSales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Rate */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">
              Attendance Rate
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="#34D399" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Fee Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">
              Platform Fee Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformFeeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#000000" name="Total Revenue" />
                <Bar dataKey="platformFee" fill="#FBBF24" name="Platform Fee (6%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics;
