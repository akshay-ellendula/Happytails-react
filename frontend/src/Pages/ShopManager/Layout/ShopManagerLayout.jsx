import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { axiosInstance } from "../../../utils/axios";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Bell,
  Moon,
  Sun,
  Settings,
} from "lucide-react";

const ShopManagerLayout = () => {
  const [vendor, setVendor] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("shopDarkMode") === "true";
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { signout } = useAuth();

  const handleLogout = async () => {
    await signout();     // ← clears AuthContext user + calls backend logout
    navigate("/service-login", { replace: true });
  };

  const isActive = (path) => location.pathname.includes(path);

  const navItems = [
    {
      path: "/shop/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
    },
    { path: "/shop/products", icon: <Package size={20} />, label: "Products" },
    { path: "/shop/orders", icon: <ShoppingCart size={20} />, label: "Orders" },
    { path: "/shop/customers", icon: <Users size={20} />, label: "Customers" },
    {
      path: "/shop/analytics",
      icon: <BarChart3 size={20} />,
      label: "Analytics",
    },
    {
      path: "/shop/settings",
      icon: <Settings size={20} />,
      label: "Settings",
    },
  ];

  // Dark mode effect — applies classes when state changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("shopDarkMode", darkMode);
  }, [darkMode]);

  // Listen for dark mode changes saved from the Settings page (same tab)
  useEffect(() => {
    const handleDarkModeChange = (e) => {
      setDarkMode(e.detail === true || e.detail === "true");
    };
    window.addEventListener("shopDarkModeChange", handleDarkModeChange);
    return () => window.removeEventListener("shopDarkModeChange", handleDarkModeChange);
  }, []);

  // Build notifications from stats — respects orderAlerts & lowStockAlerts settings
  const getNotifications = () => {
    if (!stats) return [];
    const savedSettings = (() => {
      try { return JSON.parse(localStorage.getItem("shopSettings") || "{}"); }
      catch { return {}; }
    })();
    const showOrderAlerts = savedSettings.orderAlerts !== false;
    const showLowStockAlerts = savedSettings.lowStockAlerts !== false;
    const notifs = [];

    if (showOrderAlerts && stats.activeOrdersCount > 0) {
      notifs.push({
        icon: "📦",
        text: `${stats.activeOrdersCount} active order${stats.activeOrdersCount > 1 ? 's' : ''} need attention`,
        type: "info",
        link: "/shop/orders",
      });
    }
    if (showLowStockAlerts && stats.lowStockCount > 0) {
      notifs.push({
        icon: "⚠️",
        text: `${stats.lowStockCount} product${stats.lowStockCount > 1 ? 's' : ''} running low on stock`,
        type: "warning",
        link: "/shop/products",
      });
    }
    if (showOrderAlerts) {
      const newOrders = stats.dashboardStats?.newOrders || 0;
      if (newOrders > 0) {
        notifs.push({
          icon: "🛒",
          text: `${newOrders} new order${newOrders > 1 ? 's' : ''} awaiting confirmation`,
          type: "urgent",
          link: "/shop/orders",
        });
      }
    }
    const todayRev = Number(stats.dashboardStats?.todayRevenue || 0);
    if (todayRev > 0) {
      notifs.push({
        icon: "💰",
        text: `₹${todayRev.toLocaleString()} revenue today!`,
        type: "success",
        link: "/shop/analytics",
      });
    }
    if (notifs.length === 0) {
      notifs.push({ icon: "✅", text: "All caught up! No new notifications.", type: "info", link: "" });
    }
    return notifs;
  };

  useEffect(() => {
    axiosInstance
      .get("/vendors/profile")
      .then((res) => {
        if (res.data.success) setVendor(res.data.vendor);
      })
      .catch((err) => {
        if (err.response?.status === 401) navigate("/service-login");
      });

    const loadStats = async () => {
      try {
        const [pRes, dRes] = await Promise.all([
          axiosInstance.get("/vendors/products"),
          axiosInstance.get("/vendors/dashboard"),
        ]);

        const products = pRes.data?.products || [];
        const dashboardStats = dRes.data?.stats || {};

        const totalProducts = products.length;
        const lowStockThreshold = (() => { try { return parseInt(JSON.parse(localStorage.getItem("shopSettings") || "{}").lowStockThreshold) || 15; } catch { return 15; } })();
        const lowStockCount = products.filter(
          (p) => Number(p.stock_quantity || p.stock || 0) <= lowStockThreshold,
        ).length;
        const totalRevenue = Number(dashboardStats.totalRevenue || 0);
        const activeOrdersCount = Number(dashboardStats.activeOrders || 0);

        setStats({
          totalProducts,
          lowStockCount,
          totalRevenue,
          activeOrdersCount,
          products,
          dashboardStats,
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };

    loadStats();
  }, [navigate]); // ← removed location.pathname — re-fetching on every nav change caused flicker

  // Close sidebar when clicking a nav link on mobile
  const handleNavClick = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <div className={`font-sans min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Top Navigation */}
      <div className={`sticky top-0 z-50 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Happy Tails
                  </h1>
                  <p className="text-xs text-gray-500">Vendor Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6">
                {[
                  {
                    label: "Active Orders",
                    value: stats?.activeOrdersCount ?? 0,
                    color: "text-blue-600",
                  },
                  {
                    label: "Low Stock",
                    value: stats?.lowStockCount ?? 0,
                    color: "text-red-600",
                  },
                  {
                    label: "Today's Revenue",
                    value: stats?.dashboardStats?.todayRevenue
                      ? `₹${Number(stats.dashboardStats.todayRevenue).toLocaleString()}`
                      : "₹0",
                    color: "text-green-600",
                  },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className={`text-lg font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                  className={`relative p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Bell size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                  {stats && (stats.activeOrdersCount > 0 || stats.lowStockCount > 0) && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {notifOpen && (
                  <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className={`p-3 border-b font-semibold text-sm ${darkMode ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-800'}`}>
                      Notifications
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {getNotifications().map((n, i) => (
                        <Link
                          key={i}
                          to={n.link || "#"}
                          onClick={() => setNotifOpen(false)}
                          className={`flex items-start gap-3 px-4 py-3 transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${i > 0 ? (darkMode ? 'border-t border-gray-700' : 'border-t border-gray-100') : ''}`}
                        >
                          <span className="text-lg flex-shrink-0 mt-0.5">{n.icon}</span>
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{n.text}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {vendor?.store_name?.charAt(0).toUpperCase() || "V"}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="font-medium text-gray-900">
                      {vendor?.store_name || "Vendor"}
                    </p>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {profileOpen && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : ''}`}>
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {vendor?.store_name}
                      </p>
                      <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {vendor?.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/shop/profile"
                        onClick={() => setProfileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                      >
                        <User size={18} />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/shop/settings"
                        onClick={() => setProfileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                      >
                        <Settings size={18} />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 w-full text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Mobile backdrop — closes sidebar on tap */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`${
            sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:translate-x-0 md:w-20"
          } shadow-xl h-[calc(100vh-80px)] overflow-y-auto transition-all duration-300 fixed z-40 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className="p-6">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center ${
                    sidebarOpen ? "px-4 gap-4" : "justify-center px-2"
                  } py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg transform -translate-y-1"
                      : `hover:translate-x-1 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                  }`}
                >
                  <div
                    className={`${
                      isActive(item.path) ? "text-white" : (darkMode ? "text-gray-400" : "text-gray-500")
                    } ${!sidebarOpen && "p-2"}`}
                  >
                    {item.icon}
                  </div>
                  {sidebarOpen && (
                    <span className="font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </Link>
              ))}
            </nav>

            {sidebarOpen && (
              <div className="mt-8 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border">
                <h3 className="font-bold text-gray-900 mb-3">Store Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Products</span>
                    <span className="font-bold text-gray-900">
                      {stats?.totalProducts ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Orders</span>
                    <span className="font-bold text-yellow-600">
                      {stats?.activeOrdersCount ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Total Revenue
                    </span>
                    <span className="font-bold text-green-600">
                      {stats?.totalRevenue
                        ? `₹${Number(stats.totalRevenue).toLocaleString()}`
                        : "₹0"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`flex-1 min-w-0 ${sidebarOpen ? "md:ml-64" : "md:ml-20"} transition-all duration-300`}
        >
          <div className="p-3 sm:p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopManagerLayout;
