import React, { useEffect, useState, useRef } from "react";
import { axiosInstance } from "../../../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Calendar,
  Star,
  MessageSquare,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const ShopDashboard = () => {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productRatings, setProductRatings] = useState([]);
  const [overallRatingStats, setOverallRatingStats] = useState(null);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [vendorName, setVendorName] = useState("");
  const donutRef = useRef(null);
  const miniChartRef = useRef(null);
  const navigate = useNavigate();

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, topProductsRes] = await Promise.all([
          axiosInstance.get("/vendors/dashboard"),
          axiosInstance.get("/vendors/products/top3"),
        ]);

        console.log("Dashboard response:", dashboardRes.data);
        if (dashboardRes.data.success) {
          setStats(dashboardRes.data.stats);
        }

        if (topProductsRes.data.success) {
          setTopProducts(topProductsRes.data.topProducts || []);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRatings = async () => {
      try {
        const res = await axiosInstance.get("/vendors/products/ratings");
        if (res.data.success) {
          setProductRatings(res.data.productRatings || []);
          setOverallRatingStats(res.data.overallStats || null);
        }
      } catch (error) {
        console.error("Ratings fetch error:", error);
      } finally {
        setRatingsLoading(false);
      }
    };

    // Fetch low stock products
    const fetchLowStock = async () => {
      try {
        const res = await axiosInstance.get("/vendors/products");
        if (res.data.success) {
          const prods = res.data.products || [];
          const threshold = (() => {
            try {
              return (
                parseInt(
                  JSON.parse(localStorage.getItem("shopSettings") || "{}")
                    .lowStockThreshold,
                ) || 15
              );
            } catch {
              return 15;
            }
          })();
          setLowStockProducts(
            prods.filter((p) => (p.stock_quantity || 0) <= threshold),
          );
        }
      } catch (error) {
        console.error("Low stock fetch error:", error);
      }
    };

    // Fetch vendor name for greeting
    const fetchVendor = async () => {
      try {
        const res = await axiosInstance.get("/vendors/profile");
        if (res.data.success)
          setVendorName(
            res.data.vendor?.store_name || res.data.vendor?.owner_name || "",
          );
      } catch (error) {
        /* ignore */
      }
    };

    fetchData();
    fetchRatings();
    fetchLowStock();
    fetchVendor();
  }, []);

  // Draw donut chart for order status
  useEffect(() => {
    if (!stats || !donutRef.current) return;
    const canvas = donutRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 200 * dpr;
    canvas.height = 200 * dpr;
    canvas.style.width = "200px";
    canvas.style.height = "200px";
    ctx.scale(dpr, dpr);

    const total = stats.totalOrders || 1;
    const segments = [
      { label: "New", value: stats.newOrders || 0, color: "#f59e0b" },
      {
        label: "Active",
        value: (stats.activeOrders || 0) - (stats.newOrders || 0),
        color: "#3b82f6",
      },
      {
        label: "Delivered",
        value: Math.max(total - (stats.activeOrders || 0), 0),
        color: "#10b981",
      },
    ].filter((s) => s.value > 0);

    if (segments.length === 0)
      segments.push({ label: "No Orders", value: 1, color: "#e5e7eb" });

    let startAngle = -Math.PI / 2;
    const cx = 100,
      cy = 100,
      outerR = 80,
      innerR = 55;
    segments.forEach((seg) => {
      const sliceAngle = (seg.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = "#111827";
    ctx.font = "bold 24px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(stats.totalOrders || 0, cx, cy - 8);
    ctx.font = "11px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#6b7280";
    ctx.fillText("Total", cx, cy + 12);
  }, [stats]);

  // Draw mini revenue chart (sparkline)
  useEffect(() => {
    if (!stats || !miniChartRef.current) return;
    const canvas = miniChartRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = 280,
      h = 80;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    // Use available period data as sparkline points
    const points = [
      Number(stats.todayRevenue || 0),
      Number(stats.weekRevenue || 0) / 7,
      Number(stats.weekRevenue || 0),
      Number(stats.monthRevenue || 0),
      Number(stats.totalRevenue || 0),
    ];
    const maxVal = Math.max(...points, 1);
    const padding = 8;
    const chartW = w - padding * 2;
    const chartH = h - padding * 2;

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.3)");
    gradient.addColorStop(1, "rgba(16, 185, 129, 0.02)");

    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    points.forEach((val, i) => {
      const x = padding + (i / (points.length - 1)) * chartW;
      const y = h - padding - (val / maxVal) * chartH;
      if (i === 0) ctx.lineTo(x, y);
      else {
        const prevX = padding + ((i - 1) / (points.length - 1)) * chartW;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(
          cpX,
          ctx.getTransform
            ? h - padding - (points[i - 1] / maxVal) * chartH
            : y,
          cpX,
          y,
          x,
          y,
        );
      }
    });
    ctx.lineTo(padding + chartW, h - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    points.forEach((val, i) => {
      const x = padding + (i / (points.length - 1)) * chartW;
      const y = h - padding - (val / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Dots
    points.forEach((val, i) => {
      const x = padding + (i / (points.length - 1)) * chartW;
      const y = h - padding - (val / maxVal) * chartH;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#10b981";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [stats]);

  const renderStars = (rating, size = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            size={size}
            className="text-amber-400"
            fill="currentColor"
          />,
        );
      } else if (i === fullStars && hasHalf) {
        stars.push(
          <div
            key={i}
            className="relative"
            style={{ width: size, height: size }}
          >
            <Star
              size={size}
              className="text-gray-200 absolute"
              fill="currentColor"
            />
            <div
              className="overflow-hidden absolute"
              style={{ width: size / 2 }}
            >
              <Star
                size={size}
                className="text-amber-400"
                fill="currentColor"
              />
            </div>
          </div>,
        );
      } else {
        stars.push(
          <Star
            key={i}
            size={size}
            className="text-gray-200"
            fill="currentColor"
          />,
        );
      }
    }
    return stars;
  };

  const RatingDistributionBar = ({ star, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-8 text-right text-gray-600 font-medium">
          {star}★
        </span>
        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${percentage}%`,
              background:
                star >= 4
                  ? "linear-gradient(90deg, #34d399, #10b981)"
                  : star === 3
                    ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                    : "linear-gradient(90deg, #f87171, #ef4444)",
            }}
          />
        </div>
        <span className="w-8 text-left text-gray-500 text-xs">{count}</span>
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );

  if (!stats)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No dashboard data available
          </h3>
          <p className="text-gray-500 mb-4">
            Please ensure you have orders or products.
          </p>
          <Link
            to="/shop/products/add"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Add Your First Product
          </Link>
        </div>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {getGreeting()}
            {vendorName ? `, ${vendorName}` : ""} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Here's what's happening with your store today
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={16} />
          <span className="hidden sm:inline">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="sm:hidden">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="font-semibold text-red-800 text-sm sm:text-base">
                  {lowStockProducts.length} product
                  {lowStockProducts.length > 1 ? "s" : ""} need
                  {lowStockProducts.length === 1 ? "s" : ""} restocking
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {lowStockProducts.slice(0, 5).map((p) => (
                    <span
                      key={p._id || p.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 rounded-full text-xs font-medium text-red-700"
                    >
                      {p.product_name}
                      <span className="text-red-500">
                        ({p.stock_quantity || 0})
                      </span>
                    </span>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <span className="text-xs text-red-500">
                      +{lowStockProducts.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/shop/products")}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Manage Stock <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg border border-emerald-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">
                Total Revenue
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
                ₹{stats.totalRevenue || "0.00"}
              </h3>
            </div>
            <div className="p-2 sm:p-3 bg-emerald-100 rounded-xl">
              <DollarSign className="text-emerald-600" size={20} />
            </div>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span
              className={`font-medium ${parseFloat(stats.revenueChange || 0) >= 0 ? "text-emerald-500" : "text-red-500"}`}
            >
              {parseFloat(stats.revenueChange || 0) >= 0 ? "+" : ""}
              {stats.revenueChange || 0}%
            </span>
            from last month
            {parseFloat(stats.revenueChange || 0) >= 0 ? (
              <TrendingUp className="text-emerald-500" size={16} />
            ) : (
              <TrendingUp className="text-red-500 rotate-180" size={16} />
            )}
          </div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(Math.abs(parseFloat(stats.revenueChange || 0)) * 3, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Products Sold */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">
                Products Sold
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
                {typeof stats.productsSold === "object"
                  ? stats.productsSold.total
                  : stats.productsSold || 0}
              </h3>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
              <Package className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span
              className={`font-medium ${parseFloat(stats.productsSoldChange || 0) >= 0 ? "text-blue-500" : "text-red-500"}`}
            >
              {parseFloat(stats.productsSoldChange || 0) >= 0 ? "+" : ""}
              {stats.productsSoldChange || 0}%
            </span>
            from last month
            {parseFloat(stats.productsSoldChange || 0) >= 0 ? (
              <TrendingUp className="text-blue-500" size={16} />
            ) : (
              <TrendingUp className="text-red-500 rotate-180" size={16} />
            )}
          </div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(Math.abs(parseFloat(stats.productsSoldChange || 0)) * 3, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* New Orders */}
        <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-lg border border-orange-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">
                New Orders
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
                {stats.newOrders || 0}
              </h3>
            </div>
            <div className="p-2 sm:p-3 bg-orange-100 rounded-xl">
              <ShoppingBag className="text-orange-600" size={20} />
            </div>
          </div>
          <div className="text-sm text-gray-500">Awaiting processing</div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-700"
                style={{
                  width: `${
                    stats.totalOrders > 0
                      ? Math.min(
                          Math.round(
                            ((stats.totalOrders - (stats.newOrders || 0)) /
                              stats.totalOrders) *
                              100,
                          ),
                          100,
                        )
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">
              {stats.totalOrders > 0
                ? Math.min(
                    Math.round(
                      ((stats.totalOrders - (stats.newOrders || 0)) /
                        stats.totalOrders) *
                        100,
                    ),
                    100,
                  )
                : 0}
              % processed
            </span>
          </div>
        </div>
        {/* Total Customers */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg border border-purple-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">
                Total Customers
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
                {stats.totalCustomers || 0}
              </h3>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
              <Users className="text-purple-600" size={20} />
            </div>
          </div>
          <div className="text-sm text-gray-500">Unique buyers</div>
          <div className="mt-4">
            <Link
              to="/shop/customers"
              className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue Mini Chart & Order Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Trend */}
        <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl shadow-lg border border-emerald-100/50 p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800">
                Revenue Trend
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                Today → All Time
              </p>
            </div>
            <Link
              to="/shop/analytics"
              className="text-emerald-600 hover:text-emerald-800 text-sm font-medium flex items-center gap-1"
            >
              Details <ArrowRight size={14} />
            </Link>
          </div>
          <canvas ref={miniChartRef} className="w-full" />
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
            <span>Today</span>
            <span>Avg/Day</span>
            <span>Week</span>
            <span>Month</span>
            <span>Total</span>
          </div>
        </div>

        {/* Order Status Donut */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800">
                Order Status
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                Current breakdown
              </p>
            </div>
            <Link
              to="/shop/orders"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            <canvas ref={donutRef} />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600">New</span>
                <span className="text-sm font-bold text-gray-800 ml-auto">
                  {stats.newOrders || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Active</span>
                <span className="text-sm font-bold text-gray-800 ml-auto">
                  {Math.max(
                    (stats.activeOrders || 0) - (stats.newOrders || 0),
                    0,
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-600">Delivered</span>
                <span className="text-sm font-bold text-gray-800 ml-auto">
                  {Math.max(
                    (stats.totalOrders || 0) - (stats.activeOrders || 0),
                    0,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Ratings Section */}
      <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-2xl shadow-lg border border-amber-100/50 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-amber-100/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Star
                  size={20}
                  className="text-amber-500"
                  fill="currentColor"
                />
                Product Ratings & Reviews
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Customer feedback on your products
              </p>
            </div>
            {overallRatingStats && overallRatingStats.totalRatings > 0 && (
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-amber-100 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {overallRatingStats.averageRating}
                  </div>
                  <div className="flex gap-0.5 justify-center mt-0.5">
                    {renderStars(overallRatingStats.averageRating, 12)}
                  </div>
                </div>
                <div className="h-10 w-px bg-amber-200"></div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-gray-800">
                    {overallRatingStats.totalRatings}
                  </div>
                  <div className="text-xs text-gray-500">Total Reviews</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {ratingsLoading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading ratings...</p>
          </div>
        ) : productRatings.length > 0 ? (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Overall Distribution */}
            {overallRatingStats && overallRatingStats.totalRatings > 0 && (
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                  Overall Rating Distribution
                </h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <RatingDistributionBar
                      key={star}
                      star={star}
                      count={overallRatingStats.distribution[star] || 0}
                      total={overallRatingStats.totalRatings}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Per-Product Ratings */}
            <div className="space-y-3">
              {productRatings.map((product) => {
                const isExpanded = expandedProduct === product.product_id;
                return (
                  <div
                    key={product.product_id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    {/* Product Header */}
                    <button
                      onClick={() =>
                        setExpandedProduct(
                          isExpanded ? null : product.product_id,
                        )
                      }
                      className="w-full p-4 sm:p-5 flex items-center gap-3 sm:gap-4 text-left hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Product Image */}
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.product_name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-gray-400" />
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                          {product.product_name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {renderStars(product.averageRating, 14)}
                          </div>
                          <span className="text-sm font-bold text-gray-700">
                            {product.averageRating}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {product.totalRatings}{" "}
                            {product.totalRatings === 1 ? "review" : "reviews"}
                          </span>
                        </div>
                      </div>

                      {/* Expand Icon */}
                      <div className="flex-shrink-0 p-1">
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/30">
                        {/* Mini Distribution */}
                        <div className="p-4 sm:p-5 border-b border-gray-100">
                          <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                            Rating Breakdown
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
                            {[5, 4, 3, 2, 1].map((star) => (
                              <RatingDistributionBar
                                key={star}
                                star={star}
                                count={product.distribution[star] || 0}
                                total={product.totalRatings}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Recent Reviews */}
                        {product.recentReviews &&
                          product.recentReviews.length > 0 && (
                            <div className="p-4 sm:p-5">
                              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <MessageSquare size={14} />
                                Recent Reviews
                              </h5>
                              <div className="space-y-3">
                                {product.recentReviews.map((review) => (
                                  <div
                                    key={review._id}
                                    className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-sm"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-2">
                                        {review.customer_pic ? (
                                          <img
                                            src={review.customer_pic}
                                            alt={review.customer_name}
                                            className="w-7 h-7 rounded-full object-cover border border-gray-200"
                                          />
                                        ) : (
                                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-xs font-bold text-amber-700">
                                            {review.customer_name
                                              .charAt(0)
                                              .toUpperCase()}
                                          </div>
                                        )}
                                        <span className="text-sm font-medium text-gray-700">
                                          {review.customer_name}
                                        </span>
                                        {review.isVerifiedPurchase && (
                                          <span className="flex items-center gap-0.5 text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                            <BadgeCheck size={12} />
                                            <span className="hidden sm:inline">
                                              Verified
                                            </span>
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-400">
                                        {new Date(
                                          review.created_at,
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex gap-0.5 mb-2">
                                      {renderStars(review.rating, 14)}
                                    </div>
                                    {review.title && (
                                      <p className="text-sm font-semibold text-gray-800 mb-1">
                                        {review.title}
                                      </p>
                                    )}
                                    {(
                                      review.review ||
                                      review.comment ||
                                      ""
                                    ).trim().length > 0 ? (
                                      <p className="text-sm text-gray-600 leading-relaxed">
                                        {(
                                          review.review ||
                                          review.comment ||
                                          ""
                                        ).trim()}
                                      </p>
                                    ) : (
                                      <p className="text-sm text-gray-400 italic">
                                        No written comment provided.
                                      </p>
                                    )}
                                    {review.helpful_count > 0 && (
                                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                        <ThumbsUp size={12} />
                                        <span>
                                          {review.helpful_count}{" "}
                                          {review.helpful_count === 1
                                            ? "person"
                                            : "people"}{" "}
                                          found this helpful
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-amber-300" size={32} />
            </div>
            <h3 className="text-base font-semibold text-gray-600 mb-1">
              No ratings yet
            </h3>
            <p className="text-sm text-gray-400">
              Ratings will appear here once customers review your products.
            </p>
          </div>
        )}
      </div>

      {/* Top 3 Products Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Top Selling Products
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Best performing products by revenue
            </p>
          </div>
          <Link
            to="/shop/products/view-all"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline flex items-center gap-1"
          >
            <span>View All Products</span>
            <TrendingUp size={16} />
          </Link>
        </div>

        {topProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
            {topProducts.map((product, index) => (
              <div
                key={product.product_id}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-yellow-400"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-3xl sm:text-4xl font-bold text-yellow-600">
                    #{index + 1}
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Package className="text-yellow-600" size={20} />
                  </div>
                </div>

                {product.image && (
                  <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.product_name}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                  {product.product_name}
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Revenue:</span>
                    <span className="font-bold text-green-600">
                      ₹{product.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Units Sold:</span>
                    <span className="font-semibold text-gray-800">
                      {product.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No sales data available yet.</p>
          </div>
        )}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Recent Orders
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Latest customer purchases
            </p>
          </div>
          <Link
            to="/shop/orders"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <TrendingUp size={16} />
          </Link>
        </div>

        {/* Mobile card view */}
        <div className="sm:hidden p-4 space-y-3">
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800 text-sm">
                    #ORD-{order.id.slice(-6).toUpperCase()}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.status === "Confirmed"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={14} className="text-blue-500" />
                  {order.user_name || "Unknown"}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package size={14} className="text-gray-400" />
                  {order.product_name || "N/A"}
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    {new Date(order.order_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-bold text-gray-800">
                    ₹{(order.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="mx-auto text-gray-300" size={40} />
              <p className="text-gray-500 mt-3 text-sm">
                No recent orders found.
              </p>
            </div>
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                  Order ID
                </th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                  Customer
                </th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                  Product
                </th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                  Date
                </th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                  Amount
                </th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">
                        #ORD-{order.id.slice(-6).toUpperCase()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users size={14} className="text-blue-600" />
                        </div>
                        <span className="text-gray-700">
                          {order.user_name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-gray-400" />
                        <span className="text-gray-600">
                          {order.product_name || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(order.order_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-800">
                        ₹{(order.total_amount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          order.status === "Confirmed"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "Delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="text-center">
                      <ShoppingBag
                        className="mx-auto text-gray-300"
                        size={48}
                      />
                      <p className="text-gray-500 mt-4">
                        No recent orders found.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Link
          to="/shop/products/add"
          className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3 sm:py-4 rounded-2xl font-medium hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
        >
          <Package size={20} />
          <span>Add New Product</span>
        </Link>
        <Link
          to="/shop/analytics"
          className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 sm:py-4 rounded-2xl font-medium hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
        >
          <TrendingUp size={20} />
          <span>View Sales Report</span>
        </Link>
      </div>
    </div>
  );
};

export default ShopDashboard;
