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
  Legend,
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
          const revenueTotal = Number(s.totalRevenue || 0);
          const revenueMonth = Number(s.monthRevenue || 0);
          const revenueToday = Number(s.todayRevenue || 0);

          const ordersTotal =
            Number(s.totalOrders || 0) || Number(s.newOrders || 0) || 0;
          const ordersMonth = Number(s.monthOrderCount || 0);
          const ordersWeek = Number(s.weekOrderCount || 0);
          const ordersToday = Number(s.todayOrderCount || 0);

          const revenueWeek = Number(s.weekRevenue || 0);

          const avgTotal = ordersTotal > 0 ? revenueTotal / ordersTotal : 0;
          const avgMonth = ordersMonth > 0 ? revenueMonth / ordersMonth : 0;
          const avgWeek = ordersWeek > 0 ? revenueWeek / ordersWeek : 0;
          const avgToday = ordersToday > 0 ? revenueToday / ordersToday : 0;

          setData({
            revenue: {
              total: revenueTotal.toFixed(2),
              today: revenueToday.toFixed(2),
              week: revenueWeek.toFixed(2),
              month: revenueMonth.toFixed(2),
            },
            orders: {
              total: ordersTotal,
              today: ordersToday,
              week: ordersWeek,
              month: ordersMonth,
            },
            avgOrderValue: {
              total: avgTotal.toFixed(2),
              today: avgToday.toFixed(2),
              week: avgWeek.toFixed(2),
              month: avgMonth.toFixed(2),
            },
            productsSold: s.productsSold || {
              total: 0,
              today: 0,
              week: 0,
              month: 0,
            },
            revenueOrderCount: s.revenueOrderCount || {
              total: 0,
              today: 0,
              week: 0,
              month: 0,
            },
            topProducts: s.topProducts || [],
            insights: s.insights || {
              peakHours: "No data available",
              bestDay: "No data available",
              customerGrowth: "No data available"
            }
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Analytics...</p>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No data available
          </h3>
          <p className="text-gray-500">Start making sales to see analytics</p>
        </div>
      </div>
    );

  /* Helper to safely access nested data */
  const getValue = (category) => {
    if (!data || !data[category]) return 0;
    
    // For simple numbers (if simplified in previous steps, but here we expect objects)
    if (typeof data[category] !== 'object') return data[category];

    if (period === "all") return data[category].total;
    if (category === "avgOrderValue") {
      const val = data[category][period];
      return val ? String(val) : "0.00";
    }
    return Number(data[category][period]) || 0;
  };

  /* Dynamic Chart Data Generator */
  const getChartData = () => {
    let labels = ["Today", "Week", "Month", "Total"];
    let revenueData = [
      Number(data.revenue.today),
      Number(data.revenue.week),
      Number(data.revenue.month),
      Number(data.revenue.total),
    ];
    let ordersData = [
      data.orders.today,
      data.orders.week,
      data.orders.month,
      data.orders.total,
    ];

    if (period === "today") {
      labels = ["Today"];
      revenueData = [Number(data.revenue.today)];
      ordersData = [data.orders.today];
    } else if (period === "week") {
      labels = ["Today", "Week"];
      revenueData = [Number(data.revenue.today), Number(data.revenue.week)];
      ordersData = [data.orders.today, data.orders.week];
    } else if (period === "month") {
      labels = ["Today", "Week", "Month"];
      revenueData = [
        Number(data.revenue.today),
        Number(data.revenue.week),
        Number(data.revenue.month),
      ];
      ordersData = [data.orders.today, data.orders.week, data.orders.month];
    }

    return {
      labels,
      datasets: [
        {
          label: "Revenue (₹)",
          data: revenueData,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, "rgba(34, 197, 94, 0.8)");
            gradient.addColorStop(1, "rgba(34, 197, 94, 0.2)");
            return gradient;
          },
          borderRadius: 8,
          borderSkipped: false,
          yAxisID: "y",
        },
        {
          label: "Orders",
          data: ordersData,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, "rgba(59, 130, 246, 0.8)");
            gradient.addColorStop(1, "rgba(59, 130, 246, 0.2)");
            return gradient;
          },
          borderRadius: 8,
          borderSkipped: false,
          yAxisID: "y1",
        },
      ],
    };
  };

  const chartData = getChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: "600",
          },
        },
      },
      title: {
        display: true,
        text: `Performance Overview (${period.toUpperCase()})`,
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 13 },
        displayColors: true,
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        beginAtZero: true,
        grid: {
          color: "rgba(243, 244, 246, 1)",
          borderDash: [5, 5],
        },
        title: {
          display: true,
          text: "Revenue (₹)",
          font: { weight: "bold" },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        beginAtZero: true,
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
        title: {
          display: true,
          text: "Orders",
          font: { weight: "bold" },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

/* ... inside return ... */

        {/* Orders Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Orders</h3>
            <div className="p-3 bg-blue-50 rounded-xl">
              <ShoppingBag className="text-blue-600" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {getValue("orders")}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {period === "all" ? "Total orders" : `Orders for this ${period}`}
          </p>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm group relative cursor-help">
              <span className="text-gray-600 border-b border-dotted border-gray-400">Products sold:</span>
              <span className="font-medium text-gray-800">
                {getValue("productsSold")}
              </span>
              {/* Tooltip */}
              <div className="absolute bottom-full left-0 w-48 p-2 bg-gray-800 text-white text-xs rounded hidden group-hover:block z-10 mb-2">
                Total individual items sold in this period.
              </div>
            </div>
            <div className="flex justify-between text-sm group relative cursor-help">
              <span className="text-gray-600 border-b border-dotted border-gray-400">Orders with Revenue:</span>
              <span className="font-medium text-gray-800">
                {getValue("revenueOrderCount")}
              </span>
               {/* Tooltip */}
              <div className="absolute bottom-full left-0 w-48 p-2 bg-gray-800 text-white text-xs rounded hidden group-hover:block z-10 mb-2">
                Number of completed orders that generated revenue (excludes returns/cancellations).
              </div>
            </div>
          </div>
        </div>

  const periods = ["today", "week", "month", "all"];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Track your store's performance</p>
        </div>

        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Revenue</h3>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <DollarSign className="text-emerald-600" size={20} />
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
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ 
                width: period === 'all' 
                  ? '100%' 
                  : `${Math.min(((Number(data.revenue[period]) || 0) / (Number(data.revenue.total) || 1)) * 100, 100)}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Orders</h3>
            <div className="p-3 bg-blue-50 rounded-xl">
              <ShoppingBag className="text-blue-600" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {getValue("orders")}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {period === "all" ? "Total orders" : `Orders for this ${period}`}
          </p>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm group relative cursor-help">
              <span className="text-gray-600 border-b border-dotted border-gray-400">
                Products sold:
              </span>
              <span className="font-medium text-gray-800">
                {getValue("productsSold")}
              </span>
              {/* Tooltip */}
              <div className="absolute bottom-full left-0 w-48 p-2 bg-gray-800 text-white text-xs rounded hidden group-hover:block z-10 mb-2 shadow-xl">
                Total individual items sold in this period.
              </div>
            </div>
            <div className="flex justify-between text-sm group relative cursor-help">
              <span className="text-gray-600 border-b border-dotted border-gray-400">
                Orders with Revenue:
              </span>
              <span className="font-medium text-gray-800">
                {getValue("revenueOrderCount")}
              </span>
              {/* Tooltip */}
              <div className="absolute bottom-full left-0 w-48 p-2 bg-gray-800 text-white text-xs rounded hidden group-hover:block z-10 mb-2 shadow-xl">
                Number of completed orders that generated revenue (excludes
                returns/cancellations).
              </div>
            </div>
          </div>
        </div>

        {/* Avg Order Value Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Avg Order Value</h3>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Activity className="text-purple-600" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            ₹{getValue("avgOrderValue")}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {period === "all"
              ? "All time average"
              : `Average for this ${period}`}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
               {/* 
                  Bar width logic: 
                  If Period is 'all', 100%. 
                  Otherwise, compare current avg to total avg. 
                  If current > total, full bar (100%).
                  If current < total, proportional width.
               */}
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ 
                  width: period === 'all' 
                    ? '100%' 
                    : `${Math.min(((Number(data.avgOrderValue[period]) || 0) / (Number(data.avgOrderValue.total) || 1)) * 100, 100)}%`
                }}
              ></div>
            </div>
            {period !== 'all' && (
               <span 
                 className={`text-xs ${
                   (Number(data.avgOrderValue[period]) || 0) >= (Number(data.avgOrderValue.total) || 0) 
                     ? 'text-emerald-500' 
                     : 'text-red-500'
                 }`}
               >
                 {(() => {
                    const current = Number(data.avgOrderValue[period]) || 0;
                    const total = Number(data.avgOrderValue.total) || 1; // avoid /0
                    if (total === 1 && current === 0) return '0%';
                    const diff = ((current - total) / total) * 100;
                    return `${diff > 0 ? '+' : ''}${diff.toFixed(0)}%`;
                 })()}
               </span>
            )}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="h-[400px]">
            <Bar options={chartOptions} data={chartData} />
          </div>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-2">Peak Hours</h4>
          <p className="text-sm text-gray-600">{data.insights.peakHours}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
          <h4 className="font-semibold text-gray-900 mb-2">Best Day</h4>
          <p className="text-sm text-gray-600">{data.insights.bestDay}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 border border-amber-200">
          <h4 className="font-semibold text-gray-900 mb-2">Customer Growth</h4>
          <p className="text-sm text-gray-600">{data.insights.customerGrowth}</p>
        </div>
      </div>
    </div>
  );
};

export default ShopAnalytics;
