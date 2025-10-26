import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../utils/axios";

const ShopManagerLayout = () => {
  const [vendor, setVendor] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch vendor profile for the header name
    axiosInstance
      .get("/vendors/profile")
      .then((res) => {
        console.log("Vendor Profile Response:", res.data);
        if (res.data.success) setVendor(res.data.vendor);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401)
          navigate("/service-login");
      });
  }, [navigate]);

  const handleLogout = async () => {
    await axiosInstance.post("/vendors/logout");
    navigate("/service-login");
  };

  const isActive = (path) =>
    location.pathname.includes(path)
      ? "bg-[#fbff90] font-bold"
      : "hover:bg-[#fbff90]";

  return (
    <div className="font-sans bg-[#fbff90] text-[#333] min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-[#fbff90] p-4 px-8 flex justify-between items-center shadow-md z-20 relative">
        <div className="text-3xl font-bold text-[#333]">Happy Tails</div>
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <span>Welcome, {vendor?.store_name || "Vendor"}</span>
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
            {vendor?.store_name
              ? vendor.store_name.charAt(0).toUpperCase()
              : "V"}
          </div>
        </div>

        {/* Profile Dropdown */}
        {profileOpen && (
          <div className="absolute top-[70px] right-5 bg-white rounded-md w-52 shadow-lg z-50">
            <div className="p-4 border-b border-gray-200 text-center">
              <div className="font-bold mb-2">{vendor?.store_name}</div>
              <div className="text-xs text-gray-500">{vendor?.email}</div>
            </div>
            <ul className="list-none">
              <li className="hover:bg-gray-100">
                <Link
                  to="/shop/profile"
                  className="block py-3 px-4 text-[#333]"
                >
                  My Profile
                </Link>
              </li>
              <li
                className="hover:bg-gray-100 cursor-pointer"
                onClick={handleLogout}
              >
                <span className="block py-3 px-4 text-[#333]">Logout</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white p-8 px-4 shadow-lg hidden md:block overflow-y-auto">
          <ul className="list-none">
            <li className="mb-4">
              <Link
                to="/shop/dashboard"
                className={`block py-3 px-4 rounded-md transition-colors ${isActive(
                  "/dashboard"
                )}`}
              >
                Dashboard
              </Link>
            </li>
            <li className="mb-4">
              <Link
                to="/shop/products"
                className={`block py-3 px-4 rounded-md transition-colors ${isActive(
                  "/products"
                )}`}
              >
                Products
              </Link>
            </li>
            <li className="mb-4">
              <Link
                to="/shop/orders"
                className={`block py-3 px-4 rounded-md transition-colors ${isActive(
                  "/orders"
                )}`}
              >
                Orders
              </Link>
            </li>
            <li className="mb-4">
              <Link
                to="/shop/customers"
                className={`block py-3 px-4 rounded-md transition-colors ${isActive(
                  "/customers"
                )}`}
              >
                Customers
              </Link>
            </li>
            <li className="mb-4">
              <Link
                to="/shop/analytics"
                className={`block py-3 px-4 rounded-md transition-colors ${isActive(
                  "/analytics"
                )}`}
              >
                Analytics
              </Link>
            </li>
          </ul>
        </div>
        {/* Main Page Content */}
        <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-80px)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ShopManagerLayout;
