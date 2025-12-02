import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { toast } from "react-hot-toast";
import { User, Mail, Phone, MapPin, Store, FileText } from "lucide-react";

const ShopProfile = () => {
  const [vendor, setVendor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    axiosInstance.get("/vendors/profile").then((res) => {
      if (res.data.success) {
        setVendor(res.data.vendor);
        setFormData(res.data.vendor);
      }
      setLoading(false);
    });
  };

  const handleSave = async () => {
    // Email validation: require Gmail address (same as StorePartnerForm)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(formData.email || "")) {
      toast.error("Please enter a valid Gmail address");
      return;
    }

    // Phone number validation: 10 digits starting with 6-9 (match StorePartnerForm)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone || "")) {
      toast.error(
        "Phone number must be 10 digits and start with 6, 7, 8, or 9"
      );
      return;
    }

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
        setVendor(formData); // Optimistic update
        setIsEditing(false);
        // window.location.reload(); // Not needed with React state
      }
    } catch (error) {
      toast.error("Error updating profile");
      console.error(error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Profile...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Store Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Vendor Details</h2>
        </div>

        <div className="p-8">
          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  <Store size={16} /> Store Name
                </label>
                <p className="text-lg font-medium text-gray-900">
                  {vendor.store_name}
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  <User size={16} /> Owner Name
                </label>
                <p className="text-lg font-medium text-gray-900">
                  {vendor.owner_name}
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  <Mail size={16} /> Email
                </label>
                <p className="text-lg font-medium text-gray-900">
                  {vendor.email}
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  <Phone size={16} /> Phone
                </label>
                <p className="text-lg font-medium text-gray-900">
                  {vendor.phone}
                </p>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  <MapPin size={16} /> Address
                </label>
                <p className="text-lg font-medium text-gray-900">
                  {vendor.address}
                </p>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  <FileText size={16} /> Description
                </label>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {vendor.description || "No description provided."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={formData.store_name}
                  onChange={(e) =>
                    setFormData({ ...formData, store_name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) =>
                    setFormData({ ...formData, owner_name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="9876543210"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 10 digits, starting with 6, 7, 8, or 9
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopProfile;
