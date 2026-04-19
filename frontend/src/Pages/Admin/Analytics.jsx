import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Loader from "./Components/Loader";
import ChartCard from "./Components/ChartCard";
import { axiosInstance } from "../../utils/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./admin-styles.css";

export default function Analytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [revenueChart, setRevenueChart] = useState(null);
  const [topSpenders, setTopSpenders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [events, setEvents] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const [
          statsRes,
          chartRes,
          spendersRes,
          vendorsRes,
          eventsRes,
          productsRes,
        ] = await Promise.all([
          axiosInstance.get("/admin/stats"),
          axiosInstance.get("/admin/revenue-chart"),
          axiosInstance.get("/admin/customers/top-spenders"),
          axiosInstance.get("/admin/vendors/with-revenue"),
          axiosInstance.get("/admin/events/with-revenue"),
          axiosInstance.get("/admin/products/with-revenue"),
        ]);

        setStats(statsRes.data?.stats || null);
        setRevenueChart(chartRes.data?.chartData || null);
        setTopSpenders(spendersRes.data?.topSpenders || []);
        setVendors(vendorsRes.data?.vendors || []);
        setEvents(eventsRes.data?.events || []);
        setProducts(productsRes.data?.products || []);
      } catch (err) {
        console.error("Error loading analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const topVendorRows = useMemo(() => {
    return [...vendors]
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5);
  }, [vendors]);

  const topEventRows = useMemo(() => {
    return [...events]
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5);
  }, [events]);

  const topProductRows = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5);
  }, [products]);

  const revenueData =
    revenueChart &&
    revenueChart.labels && {
      labels: revenueChart.labels,
      datasets: [
        {
          label: "Order Revenue (10%)",
          data: revenueChart.orderRevenue || [],
          borderWidth: 3,
          tension: 0.35,
          borderColor: "#F59E0B",
          backgroundColor: "rgba(245,158,11,0.12)",
          fill: true,
        },
        {
          label: "Event Revenue (10%)",
          data: revenueChart.eventRevenue || [],
          borderWidth: 3,
          tension: 0.35,
          borderColor: "#10B981",
          backgroundColor: "rgba(16,185,129,0.12)",
          fill: true,
        },
      ],
    };

  const entityData = {
    labels: ["Top Vendors", "Top Events", "Top Products"],
    datasets: [
      {
        label: "Average Revenue",
        data: [
          topVendorRows.length
            ? topVendorRows.reduce((sum, v) => sum + (v.revenue || 0), 0) / topVendorRows.length
            : 0,
          topEventRows.length
            ? topEventRows.reduce((sum, e) => sum + (e.revenue || 0), 0) / topEventRows.length
            : 0,
          topProductRows.length
            ? topProductRows.reduce((sum, p) => sum + (p.revenue || 0), 0) / topProductRows.length
            : 0,
        ],
        borderWidth: 2,
        borderColor: "#6366F1",
        backgroundColor: ["#FBBF24", "#34D399", "#60A5FA"],
      },
    ],
  };

  const downloadRevenueReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Happy Tails", 16, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Analytics Revenue Report", 16, 28);
    doc.setDrawColor(234, 179, 8);
    doc.setLineWidth(1.1);
    doc.line(16, 33, pageWidth - 16, 33);

    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 16, 39);

    autoTable(doc, {
      startY: 46,
      head: [["Metric", "Value"]],
      body: [
        ["Total Revenue", `Rs. ${formatCurrency(stats?.totalRevenue || 0)}`],
        ["Monthly Revenue", `Rs. ${formatCurrency(stats?.monthlyRevenue || 0)}`],
        ["Top Spenders Count", String(topSpenders.length)],
        ["Tracked Vendors", String(vendors.length)],
        ["Tracked Events", String(events.length)],
        ["Tracked Products", String(products.length)],
      ],
      headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [255, 251, 235] },
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: "right" } },
    });

    const trendRows = (revenueChart?.labels || []).map((label, idx) => {
      const orderRevenue = revenueChart?.orderRevenue?.[idx] || 0;
      const eventRevenue = revenueChart?.eventRevenue?.[idx] || 0;
      return [
        label,
        `Rs. ${formatCurrency(orderRevenue)}`,
        `Rs. ${formatCurrency(eventRevenue)}`,
        `Rs. ${formatCurrency(orderRevenue + eventRevenue)}`,
      ];
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Period", "Orders", "Events", "Total"]],
      body: trendRows.length ? trendRows : [["No data", "-", "-", "-"]],
      headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [255, 251, 235] },
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
    });

    doc.save(`HappyTails_Analytics_Revenue_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const downloadEntityReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Happy Tails", 16, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Top Entity Analytics Report", 16, 28);
    doc.setDrawColor(234, 179, 8);
    doc.setLineWidth(1.1);
    doc.line(16, 33, pageWidth - 16, 33);

    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 16, 39);

    autoTable(doc, {
      startY: 46,
      head: [["Top Spenders", "Email", "Spent"]],
      body: topSpenders.length
        ? topSpenders.slice(0, 10).map((u) => [u.name || "N/A", u.email || "-", `Rs. ${formatCurrency(u.totalSpent || 0)}`])
        : [["No data", "-", "-"]],
      headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [255, 251, 235] },
      styles: { fontSize: 9 },
      columnStyles: { 2: { halign: "right" } },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Top Vendors", "Revenue"]],
      body: topVendorRows.length
        ? topVendorRows.map((v) => [v.store_name || v.name || "N/A", `Rs. ${formatCurrency(v.revenue || 0)}`])
        : [["No data", "-"]],
      headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [255, 251, 235] },
      styles: { fontSize: 9 },
      columnStyles: { 1: { halign: "right" } },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Top Events", "Revenue"]],
      body: topEventRows.length
        ? topEventRows.map((e) => [e.title || "N/A", `Rs. ${formatCurrency(e.revenue || 0)}`])
        : [["No data", "-"]],
      headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [255, 251, 235] },
      styles: { fontSize: 9 },
      columnStyles: { 1: { halign: "right" } },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Top Products", "Revenue"]],
      body: topProductRows.length
        ? topProductRows.map((p) => [p.product_name || "N/A", `Rs. ${formatCurrency(p.revenue || 0)}`])
        : [["No data", "-"]],
      headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [255, 251, 235] },
      styles: { fontSize: 9 },
      columnStyles: { 1: { halign: "right" } },
    });

    doc.save(`HappyTails_Analytics_Entities_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const sectionButtonClass =
    "text-sm font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors";

  const openUser = (id) => navigate(`/admin/users/${id}`);
  const openVendor = (id) => navigate(`/admin/vendors/${id}`);
  const openEvent = (id) => navigate(`/admin/events/${id}`);
  const openProduct = (id) => navigate(`/admin/products/${id}`);

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen admin-shell">
      <Sidebar />

      <div className="ml-64 w-full admin-content">
        <Header title="Admin Analytics" />

        <div className="p-6">
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 premium-hover-card">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Revenue Intelligence</h2>
                    <p className="text-gray-600 mt-1">Centralized view of customers, shop managers, events, and products.</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">📈</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500 premium-hover-card">
                  <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl mb-3">💰</div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Total Revenue</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">₹{formatCurrency(stats?.totalRevenue || 0)}</p>
                  <button onClick={() => navigate("/admin/orders")} className="mt-4 text-sm text-yellow-700 font-semibold hover:text-yellow-800">View Orders</button>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500 premium-hover-card">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl mb-3">🗓️</div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Monthly Revenue</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">₹{formatCurrency(stats?.monthlyRevenue || 0)}</p>
                  <button onClick={() => navigate("/admin/orders")} className="mt-4 text-sm text-blue-700 font-semibold hover:text-blue-800">Go To Orders</button>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500 premium-hover-card">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl mb-3">👥</div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Top Spenders Tracked</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{topSpenders.length}</p>
                  <button onClick={() => navigate("/admin/users")} className="mt-4 text-sm text-green-700 font-semibold hover:text-green-800">Go To Users</button>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-indigo-500 premium-hover-card">
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl mb-3">🧩</div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Revenue Entities</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{vendors.length + events.length + products.length}</p>
                  <button onClick={() => navigate("/admin/vendors")} className="mt-4 text-sm text-indigo-700 font-semibold hover:text-indigo-800">Go To Shop Managers</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ChartCard
                  title="Revenue Trend"
                  subtitle="Orders and Events (10% admin share)"
                  chartData={revenueData || { labels: [], datasets: [] }}
                  type="line"
                  actionButton={
                    <button onClick={() => navigate("/admin/orders")} className={sectionButtonClass}>
                      Open Orders
                    </button>
                  }
                  onDownloadReport={downloadRevenueReport}
                />
                <ChartCard
                  title="Entity Revenue Snapshot"
                  subtitle="Average of top 5 in each category"
                  chartData={entityData}
                  type="bar"
                  actionButton={
                    <button onClick={() => navigate("/admin/dashboard")} className={sectionButtonClass}>
                      Back To Dashboard
                    </button>
                  }
                  onDownloadReport={downloadEntityReport}
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 premium-hover-card">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">👑 Top Spenders</h3>
                    <button onClick={() => navigate("/admin/users")} className={sectionButtonClass}>Open Users</button>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Based on total customer spending from orders + event tickets, represented as the platform share returned by your backend endpoint.
                  </p>
                  <div className="space-y-3">
                    {topSpenders.length === 0 ? (
                      <div className="text-gray-500">No data available</div>
                    ) : (
                      topSpenders.map((u, idx) => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl premium-hover-row">
                          <div>
                            <p className="font-semibold text-gray-800">#{idx + 1} {u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-green-700">₹{formatCurrency(u.totalSpent || 0)}</p>
                            <button onClick={() => openUser(u.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-green-200 text-green-700 hover:bg-green-100">Open</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 premium-hover-card">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">🏪 Top Vendors by Revenue</h3>
                    <button onClick={() => navigate("/admin/vendors")} className={sectionButtonClass}>Open Shop Managers</button>
                  </div>
                  <div className="space-y-3">
                    {topVendorRows.length === 0 ? (
                      <div className="text-gray-500">No data available</div>
                    ) : (
                      topVendorRows.map((v, idx) => (
                        <div key={v.id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl premium-hover-row">
                          <p className="font-semibold text-gray-800">#{idx + 1} {v.store_name || v.name || "N/A"}</p>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-blue-700">₹{formatCurrency(v.revenue || 0)}</p>
                            <button onClick={() => openVendor(v.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-100">Open</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 premium-hover-card">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">🎪 Top Events by Revenue</h3>
                    <button onClick={() => navigate("/admin/events")} className={sectionButtonClass}>Open Events</button>
                  </div>
                  <div className="space-y-3">
                    {topEventRows.length === 0 ? (
                      <div className="text-gray-500">No data available</div>
                    ) : (
                      topEventRows.map((e, idx) => (
                        <div key={e._id || e.id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl premium-hover-row">
                          <p className="font-semibold text-gray-800">#{idx + 1} {e.title || "N/A"}</p>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-purple-700">₹{formatCurrency(e.revenue || 0)}</p>
                            <button onClick={() => openEvent(e._id || e.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-100">Open</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 premium-hover-card">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">🛍️ Top Products by Revenue</h3>
                    <button onClick={() => navigate("/admin/products")} className={sectionButtonClass}>Open Products</button>
                  </div>
                  <div className="space-y-3">
                    {topProductRows.length === 0 ? (
                      <div className="text-gray-500">No data available</div>
                    ) : (
                      topProductRows.map((p, idx) => (
                        <div key={p.id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl premium-hover-row">
                          <p className="font-semibold text-gray-800">#{idx + 1} {p.product_name || "N/A"}</p>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-indigo-700">₹{formatCurrency(p.revenue || 0)}</p>
                            <button onClick={() => openProduct(p.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100">Open</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

