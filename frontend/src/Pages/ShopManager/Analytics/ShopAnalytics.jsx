import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { BarChart, Activity, DollarSign, ShoppingBag } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ShopAnalytics = () => {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get("/vendors/dashboard");
        if (res.data && res.data.success && res.data.stats) {
          const s = res.data.stats;
          const revenue = Number(s.totalRevenue || 0);
          const newOrders = Number(s.newOrders || 0);
          const totalOrders = Number(s.totalOrders || 0);
          const avg = newOrders > 0 ? (revenue / newOrders).toFixed(2) : "0.00";
          setData({
            revenue: {
              total: revenue.toFixed(2),
              today: revenue.toFixed(2),
              week: revenue.toFixed(2),
              month: revenue.toFixed(2),
            },
            orders: {
              // show total orders when 'all' period is selected
              total: totalOrders,
              today: newOrders,
              week: newOrders,
              month: newOrders,
            },
            avgOrderValue: { total: avg, month: avg },
            productsSold: s.productsSold || 0,
            revenueOrderCount: s.revenueOrderCount || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading)
    return <div className="p-8 text-center">Loading Analytics...</div>;
  if (!data) return <div className="p-8 text-center">No data available.</div>;

  const getValue = (category) => {
    if (period === "all") return data[category].total;
    return data[category][period] || 0;
  };

  const chartData = {
    labels: ["Today", "Week", "Month"],
    datasets: [
      {
        label: "Revenue (₹)",
        data: [data.revenue.today, data.revenue.week, data.revenue.month],
        backgroundColor: "rgba(34, 197, 94, 0.6)",
      },
      {
        label: "Orders",
        data: [data.orders.today, data.orders.week, data.orders.month],
        backgroundColor: "rgba(59, 130, 246, 0.6)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Performance Overview",
      },
    },
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          {["today", "week", "month", "all"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Revenue</h3>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            ₹{getValue("revenue")}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {period === "all"
              ? "Total earnings"
              : `Earnings for this ${period}`}
          </p>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Orders</h3>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <ShoppingBag size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {getValue("orders")}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {period === "all" ? "Total orders" : `Orders for this ${period}`}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Products sold:{" "}
            <span className="font-medium text-gray-800">
              {data.productsSold}
            </span>
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Revenue from{" "}
            <span className="font-medium text-gray-800">
              {data.revenueOrderCount}
            </span>{" "}
            orders
          </p>
        </div>

        {/* Avg Order Value Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Avg Order Value</h3>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Activity size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            ₹
            {period === "month"
              ? data.avgOrderValue.month
              : data.avgOrderValue.total}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {period === "month" ? "This month" : "All time average"}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <Bar options={chartOptions} data={chartData} />
      </div>
    </div>
  );
};

export default ShopAnalytics;
