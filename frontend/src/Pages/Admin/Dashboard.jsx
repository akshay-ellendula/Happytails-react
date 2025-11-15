// src/Admin/Dashboard.jsx

import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import StatsCard from "./Components/StatsCard";
import ChartCard from "./Components/ChartCard";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import { axiosInstance } from "../../utils/axios";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);





export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenueChart, setRevenueChart] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEverything() {
      try {
        const [statsRes, chartRes, usersRes] = await Promise.all([
          axiosInstance.get("/admin/stats"),
          axiosInstance.get("/admin/revenue-chart"),
          axiosInstance.get("/admin/customers/latest"),
        ]);

        setStats(statsRes.data.stats);
        setRevenueChart(chartRes.data.chartData);
        setRecentUsers(usersRes.data.users || []);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEverything();
  }, []);

  const recentColumns = [
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
    { key: "joined_date", title: "Joined", render: (d) => new Date(d).toLocaleDateString() },
  ];

  const revenueData = revenueChart && {
    labels: revenueChart.labels,
    datasets: [
      {
        label: "Order Revenue (10% Tax)",
        data: revenueChart.orderRevenue,
        borderWidth: 2,
        tension: 0.3,
      },
      {
        label: "Event Revenue (10% Tax)",
        data: revenueChart.eventRevenue,
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  const distributionData = stats && {
    labels: ["Users", "Vendors", "Event Managers"],
    datasets: [
      {
        data: [
          stats.totalUsers,
          stats.totalVendors,
          stats.totalEventManagers,
        ],
        backgroundColor: ["#f3ef56", "#8fbc8f", "#ff9999"],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Header title="Admin Dashboard" />

        <main className="p-6">
          {loading ? (
            <Loader />
          ) : (
            <>
              {/* FIRST ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatsCard title="Total Users" value={stats.totalUsers} />
                <StatsCard title="Shop Vendors" value={stats.totalVendors} />
                <StatsCard
                  title="Event Managers"
                  value={stats.totalEventManagers}
                />
                <StatsCard title="Total Events" value={stats.totalEvents} />
              </div>

              {/* SECOND ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatsCard
                  title="Total Revenue (10% tax)"
                  value={"₹" + stats.totalRevenue.toLocaleString()}
                />
                <StatsCard
                  title="Monthly Revenue"
                  value={"₹" + stats.monthlyRevenue.toLocaleString()}
                />
                <StatsCard
                  title="Weekly Revenue"
                  value={"₹" + stats.weeklyRevenue.toLocaleString()}
                />
                <StatsCard
                  title="Today's Revenue"
                  value={"₹" + stats.dailyRevenue.toLocaleString()}
                />
              </div>

              {/* CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ChartCard
                  title="Revenue Overview (10% tax)"
                  chartData={revenueData}
                  chartOptions={{ responsive: true }}
                />

                <ChartCard
                  title="User Distribution"
                  chartData={distributionData}
                  type="doughnut"
                />
              </div>

              {/* RECENT USERS */}
              <div className="bg-white shadow-sm p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
                <Table columns={recentColumns} data={recentUsers} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
