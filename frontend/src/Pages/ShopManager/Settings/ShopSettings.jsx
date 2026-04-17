import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Shield,
  ShoppingBag,
  Package,
  Save,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

const ShopSettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("shopSettings");
    return saved
      ? JSON.parse(saved)
      : {
          emailNotifications: true,
          orderAlerts: true,
          lowStockAlerts: true,
          lowStockThreshold: 15,
          defaultShippingMethod: "Standard",
          autoConfirmOrders: false,
          darkMode: localStorage.getItem("shopDarkMode") === "true",
          currency: "INR",
        };
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    // Dark mode: apply instantly so user sees visual feedback right away
    if (key === "darkMode") {
      window.dispatchEvent(new CustomEvent("shopDarkModeChange", { detail: value }));
      localStorage.setItem("shopDarkMode", value);
      if (value) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
  };

  const handleSave = () => {
    localStorage.setItem("shopSettings", JSON.stringify(settings));
    // Sync dark mode with layout
    localStorage.setItem("shopDarkMode", settings.darkMode);
    // Notify the Layout in the same tab via a custom event
    window.dispatchEvent(new CustomEvent("shopDarkModeChange", { detail: settings.darkMode }));
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setSaved(true);
    toast.success("Settings saved!");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Settings
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your store preferences and configurations
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg"
          }`}
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Bell className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">
              Configure alert preferences
            </p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {[
            {
              key: "orderAlerts",
              label: "New Order Alerts",
              desc: "Show alerts when new orders come in",
            },
            {
              key: "lowStockAlerts",
              label: "Low Stock Alerts",
              desc: "Show alert when products are running low",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
            >
              <div>
                <p className="font-medium text-gray-800">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() => handleChange(item.key, !settings[item.key])}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings[item.key] ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings[item.key] ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Settings */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-xl">
            <Package className="text-amber-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Inventory</h2>
            <p className="text-sm text-gray-500">
              Stock and product preferences
            </p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-800">
                Low Stock Threshold
              </p>
              <p className="text-sm text-gray-500">
                Products below this quantity are marked as low stock
              </p>
            </div>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.lowStockThreshold}
              onChange={(e) =>
                handleChange("lowStockThreshold", parseInt(e.target.value) || 15)
              }
              className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-center font-medium focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Order Management */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <ShoppingBag className="text-orange-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Order Management</h2>
            <p className="text-sm text-gray-500">Order processing preferences</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-800">Auto-confirm Orders</p>
              <p className="text-sm text-gray-500">
                Automatically confirm new orders without manual review
              </p>
            </div>
            <button
              onClick={() =>
                handleChange("autoConfirmOrders", !settings.autoConfirmOrders)
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.autoConfirmOrders ? "bg-emerald-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.autoConfirmOrders
                    ? "translate-x-6"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            {settings.darkMode ? (
              <Moon className="text-indigo-600" size={20} />
            ) : (
              <Sun className="text-indigo-600" size={20} />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Appearance</h2>
            <p className="text-sm text-gray-500">Customize the look</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div>
              <p className="font-medium text-gray-800">Dark Mode</p>
              <p className="text-sm text-gray-500">
                Toggle between light and dark themes
              </p>
            </div>
            <button
              onClick={() => handleChange("darkMode", !settings.darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.darkMode ? "bg-indigo-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.darkMode ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-xl">
            <Shield className="text-red-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Security</h2>
            <p className="text-sm text-gray-500">Account security settings</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-800">Change Password</p>
              <p className="text-sm text-gray-500">
                Update your account password
              </p>
            </div>
            <Link
              to="/shop/profile"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
            >
              Go to Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSettings;
