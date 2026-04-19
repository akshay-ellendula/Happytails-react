// src/Admin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import StatsCard from "./Components/StatsCard";
import ChartCard from "./Components/ChartCard";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import { axiosInstance } from "../../utils/axios";
import "./admin-styles.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [showWelcome, setShowWelcome] = useState(true);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const recentColumns = [
    {
      key: "name",
      title: "Name",
      render: (name) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold mr-3">
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{name}</span>
        </div>
      )
    },
    {
      key: "email",
      title: "Email",
      render: (email) => <span className="text-gray-600">{email}</span>
    },
    {
      key: "joined_date",
      title: "Joined",
      render: (d) => new Date(d).toLocaleDateString()
    },
  ];

  const revenueData = revenueChart && {
    labels: revenueChart.labels,
    datasets: [
      {
        label: "Order Revenue (10% Tax)",
        data: revenueChart.orderRevenue,
        borderWidth: 3,
        tension: 0.4,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        fill: true,
      },
      {
        label: "Event Revenue (10% Tax)",
        data: revenueChart.eventRevenue,
        borderWidth: 3,
        tension: 0.4,
        borderColor: '#FBC02D',
        backgroundColor: 'rgba(251, 192, 45, 0.1)',
        fill: true,
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
        backgroundColor: ["#FFD700", "#FBC02D", "#FFB300"],
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function (value) {
            return '₹' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      }
    }
  };

  // ── PDF: Revenue Overview Report ──
  const downloadRevenueReport = () => {
    if (!revenueChart || !stats) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const colorBlack = "#1a1a1a";
    const colorYellow = [255, 215, 0];

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(colorBlack);
    doc.text("HAPPY TAILS", 20, 25);

    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text("Revenue Overview Report", 20, 34);

    doc.setDrawColor(...colorYellow);
    doc.setLineWidth(1.5);
    doc.line(20, 40, pageWidth - 20, 40);

    // Generated date
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(130);
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, 20, 48);

    // Revenue summary cards
    let yPos = 58;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colorBlack);
    doc.text("Revenue Summary", 20, yPos);
    yPos += 8;

    const summaryData = [
      ["Total Revenue", `Rs. ${stats.totalRevenue.toLocaleString()}`],
      ["Monthly Revenue", `Rs. ${stats.monthlyRevenue.toLocaleString()}`],
      ["Weekly Revenue", `Rs. ${stats.weeklyRevenue.toLocaleString()}`],
      ["Today's Revenue", `Rs. ${stats.dailyRevenue.toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["Metric", "Amount"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: colorBlack, textColor: [255, 255, 255], fontStyle: "bold", halign: "left", cellPadding: 4 },
      bodyStyles: { textColor: 50, cellPadding: 3 },
      alternateRowStyles: { fillColor: [255, 253, 230] },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
      styles: { fontSize: 10, lineColor: 240 },
    });

    // Monthly breakdown table
    yPos = doc.lastAutoTable.finalY + 14;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colorBlack);
    doc.text("Monthly Revenue Breakdown (10% Tax)", 20, yPos);
    yPos += 8;

    const monthlyRows = revenueChart.labels.map((label, idx) => {
      const orderRev = revenueChart.orderRevenue[idx] || 0;
      const eventRev = revenueChart.eventRevenue[idx] || 0;
      const total = orderRev + eventRev;
      return [label, `Rs. ${orderRev.toLocaleString()}`, `Rs. ${eventRev.toLocaleString()}`, `Rs. ${total.toLocaleString()}`];
    });

    autoTable(doc, {
      startY: yPos,
      head: [["Month", "Order Revenue", "Event Revenue", "Total"]],
      body: monthlyRows,
      theme: "grid",
      headStyles: { fillColor: colorBlack, textColor: [255, 255, 255], fontStyle: "bold", halign: "left", cellPadding: 4 },
      bodyStyles: { textColor: 50, cellPadding: 3 },
      alternateRowStyles: { fillColor: [255, 253, 230] },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right", fontStyle: "bold" } },
      styles: { fontSize: 10, lineColor: 240 },
    });

    // Footer
    const footerY = doc.internal.pageSize.height - 15;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Happy Tails Admin Dashboard  •  Confidential", pageWidth / 2, footerY, { align: "center" });

    doc.save(`HappyTails_Revenue_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // ── PDF: User Distribution Report ──
  const downloadDistributionReport = () => {
    if (!stats) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const colorBlack = "#1a1a1a";
    const colorYellow = [255, 215, 0];

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(colorBlack);
    doc.text("HAPPY TAILS", 20, 25);

    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text("User Distribution Report", 20, 34);

    doc.setDrawColor(...colorYellow);
    doc.setLineWidth(1.5);
    doc.line(20, 40, pageWidth - 20, 40);

    // Generated date
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(130);
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, 20, 48);

    // Platform overview
    let yPos = 58;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colorBlack);
    doc.text("Platform Overview", 20, yPos);
    yPos += 8;

    const totalPeople = stats.totalUsers + stats.totalVendors + stats.totalEventManagers;

    const overviewData = [
      ["Total Events", stats.totalEvents.toLocaleString()],
      ["Total Revenue", `Rs. ${stats.totalRevenue.toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["Metric", "Value"]],
      body: overviewData,
      theme: "grid",
      headStyles: { fillColor: colorBlack, textColor: [255, 255, 255], fontStyle: "bold", halign: "left", cellPadding: 4 },
      bodyStyles: { textColor: 50, cellPadding: 3 },
      alternateRowStyles: { fillColor: [255, 253, 230] },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
      styles: { fontSize: 10, lineColor: 240 },
    });

    // User distribution table
    yPos = doc.lastAutoTable.finalY + 14;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colorBlack);
    doc.text("User Distribution Breakdown", 20, yPos);
    yPos += 8;

    const userCalcPct = (val) => totalPeople > 0 ? ((val / totalPeople) * 100).toFixed(1) + "%" : "0%";

    const distributionRows = [
      ["Users", stats.totalUsers.toLocaleString(), userCalcPct(stats.totalUsers)],
      ["Shop Vendors", stats.totalVendors.toLocaleString(), userCalcPct(stats.totalVendors)],
      ["Event Managers", stats.totalEventManagers.toLocaleString(), userCalcPct(stats.totalEventManagers)],
    ];

    // Add total row
    distributionRows.push(["Total", totalPeople.toLocaleString(), "100%"]);

    autoTable(doc, {
      startY: yPos,
      head: [["Role", "Count", "Percentage"]],
      body: distributionRows,
      theme: "grid",
      headStyles: { fillColor: colorBlack, textColor: [255, 255, 255], fontStyle: "bold", halign: "left", cellPadding: 4 },
      bodyStyles: { textColor: 50, cellPadding: 3 },
      alternateRowStyles: { fillColor: [255, 253, 230] },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right", fontStyle: "bold" } },
      styles: { fontSize: 10, lineColor: 240 },
      didParseCell: function (data) {
        // Bold the total row
        if (data.row.index === distributionRows.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [255, 245, 157];
        }
      },
    });

    // Footer
    const footerY = doc.internal.pageSize.height - 15;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Happy Tails Admin Dashboard  •  Confidential", pageWidth / 2, footerY, { align: "center" });

    doc.save(`HappyTails_User_Distribution_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex admin-shell">
      <Sidebar />

      <div className="flex-1 ml-64 admin-content">
        <Header title="Admin Dashboard" />

        <main className="p-6">
          {/* Welcome Banner */}
          {showWelcome && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-100 via-yellow-50 to-white border border-amber-200 shadow-lg animate-fade-out premium-hover-card">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white text-2xl mr-4 shadow-md">
                  👋
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome back, Admin!</h1>
                  <p className="text-gray-600">Here's what's happening with your platform today.</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <Loader />
          ) : (
            <>
              {/* FIRST ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500 premium-hover-card admin-kpi admin-kpi-accent">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm text-gray-600 uppercase tracking-wider">Total Users</h3>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">
                      👥
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-orange-500 premium-hover-card admin-kpi admin-kpi-accent">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm text-gray-600 uppercase tracking-wider">Shop Vendors</h3>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalVendors.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 text-xl">
                      🏪
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-amber-500 premium-hover-card admin-kpi admin-kpi-accent">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm text-gray-600 uppercase tracking-wider">Event Managers</h3>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalEventManagers.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-xl">
                      🎪
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-red-500 premium-hover-card admin-kpi admin-kpi-accent">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm text-gray-600 uppercase tracking-wider">Total Events</h3>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalEvents.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-xl">
                      📅
                    </div>
                  </div>
                </div>
              </div>

              {/* SECOND ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500 premium-hover-card admin-kpi admin-kpi-accent">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm text-gray-600 uppercase tracking-wider">Total Revenue</h3>
                      <p className="text-3xl font-bold text-gray-800 mt-2">₹{stats.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">(10% tax included)</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl">
                      💰
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-teal-500 premium-hover-card admin-kpi admin-kpi-accent">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm text-gray-600 uppercase tracking-wider">Monthly Revenue</h3>
                      <p className="text-3xl font-bold text-gray-800 mt-2">₹{stats.monthlyRevenue.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 text-xl">
                      📈
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500 premium-hover-card admin-kpi admin-kpi-accent">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm text-gray-600 uppercase tracking-wider">Weekly Revenue</h3>
                      <p className="text-3xl font-bold text-gray-800 mt-2">₹{stats.weeklyRevenue.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                      📊
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500 premium-hover-card admin-kpi admin-kpi-accent">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm text-gray-600 uppercase tracking-wider">Today's Revenue</h3>
                      <p className="text-3xl font-bold text-gray-800 mt-2">₹{stats.dailyRevenue.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                      ⚡
                    </div>
                  </div>
                </div>
              </div>

              {/* CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ChartCard
                  title="Revenue Overview (10% tax)"
                  chartData={revenueData}
                  chartOptions={revenueChartOptions}
                  type="line"
                  onDownloadReport={downloadRevenueReport}
                />

                <ChartCard
                  title="User Distribution"
                  chartData={distributionData}
                  type="doughnut"
                  onDownloadReport={downloadDistributionReport}
                />
              </div>

              {/* RECENT USERS */}
              <div className="bg-white rounded-2xl shadow-lg p-6 premium-hover-card admin-panel">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Recent Users</h3>
                    <p className="text-gray-500 text-sm">New users joined recently</p>
                  </div>
                </div>
                <Table columns={recentColumns} data={recentUsers} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

