import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
} from "lucide-react";

const ShopManagerLayout = () => {
  const [vendor, setVendor] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await axiosInstance.post("/vendors/logout");
    navigate("/service-login");
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
  ];

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
        const lowStockCount = products.filter(
          (p) => Number(p.stock_quantity || p.stock || 0) <= 15,
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
  }, [navigate, location.pathname]);

  return (
    <div className="font-sans bg-gray-50 min-h-screen transition-colors duration-200">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-white shadow-lg">
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
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                    <div className="p-4 border-b">
                      <p className="font-medium text-gray-900">
                        {vendor?.store_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {vendor?.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/shop/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
                      >
                        <User size={18} />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-red-600 w-full text-left"
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
        <div
          className={`${
            sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:translate-x-0 md:w-20"
          } bg-white shadow-xl h-[calc(100vh-80px)] overflow-y-auto transition-all duration-300 fixed z-40`}
        >
          <div className="p-6">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center ${
                    sidebarOpen ? "px-4 gap-4" : "justify-center px-2"
                  } py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg transform -translate-y-1"
                      : "text-gray-700 hover:bg-gray-100 hover:translate-x-1"
                  }`}
                >
                  <div
                    className={`${
                      isActive(item.path) ? "text-white" : "text-gray-500"
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
          className={`flex-1 ${sidebarOpen ? "md:ml-64" : "md:ml-20"} transition-all duration-300`}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopManagerLayout;
