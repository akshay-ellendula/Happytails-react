import React, { useEffect, useState, useCallback } from "react";
import { axiosInstance } from "../../../utils/axios";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Store,
  FileText,
  Edit,
  Save,
  X,
  Shield,
  Calendar,
  Star,
  Award,
  CheckCircle,
  Package,
  Lock,
} from "lucide-react";

const ShopProfile = () => {
  const [vendor, setVendor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeStats, setStoreStats] = useState({
    productCount: 0,
    totalSales: 0,
    activeSince: "—",
  });

  useEffect(() => {
    fetchProfile();
    fetchStoreStats();
  }, []);

  const fetchProfile = useCallback(() => {
    axiosInstance
      .get("/vendors/profile")
      .then((res) => {
        if (res.data.success) {
          setVendor(res.data.vendor);
          setFormData(res.data.vendor);
        } else {
          toast.error("Failed to load profile");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        toast.error("Error loading profile");
        setLoading(false);
      });
  }, []);

  const fetchStoreStats = useCallback(() => {
    Promise.all([
      axiosInstance.get("/vendors/products"),
      axiosInstance.get("/vendors/dashboard"),
    ])
      .then(([productsRes, dashboardRes]) => {
        let stats = {
          productCount: 0,
          totalSales: 0,
          activeSince: "—",
        };

        if (
          productsRes.data.success &&
          Array.isArray(productsRes.data.products)
        ) {
          stats.productCount = productsRes.data.products.length;
        }

        if (dashboardRes.data.success && dashboardRes.data.stats) {
          const totalRevenue = dashboardRes.data.stats.totalRevenue || 0;
          stats.totalSales = parseFloat(totalRevenue).toLocaleString("en-IN");
          stats.totalCustomers = dashboardRes.data.stats.totalCustomers || 0;
        }

        /* Removed Active Since calculation */

        setStoreStats(stats);
      })
      .catch((err) => {
        console.error("Store stats fetch error:", err);
      });
  }, [vendor]);

  const handleSave = async () => {
    // Email validation: require Gmail address
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(formData.email || "")) {
      toast.error("Please enter a valid Gmail address");
      return;
    }

    // Phone number validation: 10 digits starting with 6-9
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone || "")) {
      toast.error(
        "Phone number must be 10 digits and start with 6, 7, 8, or 9",
      );
      return;
    }

    setSaving(true);

    try {
      const res = await axiosInstance.put("/vendors/profile", {
        storeName: formData.store_name,
        ownerName: formData.owner_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
      });

      if (res.data.message) {
        toast.success("Profile updated successfully");
        setVendor(formData);
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Error updating profile");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await axiosInstance.put("/vendors/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data.message) {
        toast.success(res.data.message);
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update password");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Profile...</p>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Profile</h1>
          <p className="text-gray-500 mt-1">Manage your store information</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Store Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="font-medium text-emerald-600">Active</span>
            </div>
          </div>

          {!isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                <Lock size={18} />
                <span>Password</span>
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Edit size={18} />
                <span className="font-medium">Edit Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Overview */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Vendor Profile</h2>
              <p className="text-gray-300 text-sm mt-1">
                Complete store details
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Store className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="p-8">
          {!isEditing ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Store Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Store className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Store Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      <Store size={16} /> Store Name
                    </label>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {vendor.store_name}
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      <User size={16} /> Owner Name
                    </label>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {vendor.owner_name}
                    </p>
                  </div>

                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Mail className="text-emerald-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Contact Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      <Mail size={16} /> Email
                    </label>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {vendor.email}
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      <Phone size={16} /> Phone
                    </label>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {vendor.phone}
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      <MapPin size={16} /> Address
                    </label>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {vendor.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Store Description */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FileText className="text-purple-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Store Description
                  </h3>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-700 leading-relaxed">
                    {vendor.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    value={formData.store_name}
                    onChange={(e) =>
                      setFormData({ ...formData, store_name: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={(e) =>
                      setFormData({ ...formData, owner_name: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Must be a Gmail address
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="9876543210"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Format: 10 digits, starting with 6, 7, 8, or 9
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    saving
                      ? "bg-emerald-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-green-500 hover:shadow-lg"
                  } text-white`}
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Store Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">
                Products Listed
              </p>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {storeStats?.productCount || 0}
              </p>
            </div>
            <Package className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">
                Total Sales
              </p>
              <p className="text-2xl font-bold text-emerald-900 mt-2">
                ₹{storeStats?.totalSales || 0}
              </p>
            </div>
            <Award className="text-emerald-500" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">
                Total Customers
              </p>
              <p className="text-2xl font-bold text-yellow-900 mt-2">
                {storeStats?.totalCustomers || 0}
              </p>
            </div>
            <User className="text-yellow-500" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopProfile;
