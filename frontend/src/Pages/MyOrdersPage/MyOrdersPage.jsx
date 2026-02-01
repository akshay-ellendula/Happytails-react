import React, { useEffect, useState } from "react";
// UPDATED: Import Header and MobileMenu
import Header from "../../components/Header";
import MobileMenu from "../../components/MobileMenu";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { axiosInstance } from "../../utils/axios";
import { useNavigate } from "react-router"; //

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // UPDATED: Add mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTrackOrder = (order) => {
    navigate(`/track-order/${order.id || order._id}`, { state: { order } });
  };

  useEffect(() => {
    axiosInstance
      .get("/products/getUserOrders")
      .then((res) => res.data)
      .then((data) => {
        if (data.success) setOrders(data.orders);
        else alert("Error fetching orders: " + data.message);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        alert(
          "Error fetching orders: " +
            (err.response?.data?.message || err.message)
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleBuyAgain = async (orderId) => {
    try {
      const res = await axiosInstance.post(
        `/products/orders/${orderId}/reorder`
      );
      const data = res.data;

      if (data.success) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        data.cart.forEach((item) => {
          const existing = cart.findIndex(
            (c) =>
              c.product_id === item.product_id &&
              c.variant_id === item.variant_id &&
              c.size === item.size &&
              c.color === item.color
          );
          if (existing > -1) cart[existing].quantity += item.quantity;
          else cart.push(item);
        });

        localStorage.setItem("cart", JSON.stringify(cart));
        alert("Items added to cart successfully!");
        window.location.href = "/pet_accessory";
      } else alert("Error reordering: " + data.message);
    } catch (err) {
      console.error(err);
      alert(
        "Error adding items to cart: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const renderOrderCard = (order) => {
    const item = order.items[0];
    let imageSrc = "";

    // frontend/src/Pages/MyOrdersPage/MyOrdersPage.jsx

    if (item?.image_data) {
      if (
        item.image_data.startsWith("data:") ||
        item.image_data.startsWith("http")
      ) {
        imageSrc = item.image_data;
      } else if (!item.image_data.startsWith("/images/")) {
        imageSrc = `data:image/jpeg;base64,${item.image_data}`;
      } else {
        imageSrc = item.image_data; // fallback for local /images/ paths
      }
    }

    const formatDate = (d) =>
      new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    const getDeliveryDisplay = (order, isDelivered) => {
      if (isDelivered) {
        if (order.delivery_date) return formatDate(order.delivery_date);
        if (order.delivered_at) return formatDate(order.delivered_at);
        // fallback: find timeline out for delivery or delivered
        const evt = (order.timeline || []).find(
          (t) =>
            (t.status && t.status.toLowerCase().includes("out")) ||
            (t.status && t.status.toLowerCase().includes("deliv"))
        );
        if (evt && evt.date) return formatDate(evt.date);
        return "N/A";
      }
      // current orders: expected 10 days from order_date
      try {
        const base = order.order_date ? new Date(order.order_date) : new Date();
        const expected = new Date(base);
        expected.setDate(expected.getDate() + 10);
        return `Est: ${expected.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        return "Est: N/A";
      }
    };

    return (
      <div
        key={order.id || order._id}
        className="border-2 border-dark rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image */}
          <div className="shrink-0">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-dark">
                {order.status === "Delivered"
                  ? `Delivered on ${getDeliveryDisplay(order, true)}`
                  : "Order Placed"}
              </h3>
            </div>
            <div className="w-56 h-56 mx-auto bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-dark mb-3">
                {item.product_name}{" "}
                {order.items.length > 1 && (
                  <span className="text-gray-600 text-lg">
                    and {order.items.length - 1} more
                  </span>
                )}
              </h2>
              <div className="space-y-2 mb-6">
                <p className="text-gray-700">
                  <span className="font-bold text-dark">Order ID:</span>{" "}
                  {order.id || order._id}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold text-dark">Order Date:</span>{" "}
                  {new Date(order.order_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold text-dark">Delivery Date:</span>{" "}
                  {order.status === "Delivered"
                    ? getDeliveryDisplay(order, true)
                    : getDeliveryDisplay(order, false)}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold text-dark">Status:</span>{" "}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Shipped"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleBuyAgain(order.id)}
                className="bg-dark text-primary px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Buy Again
              </button>
              <button
                onClick={() => handleTrackOrder(order)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Order Details
              </button>
              {order.status === "Delivered" && (
                <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Return Product
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentOrders = orders.filter((o) => o.status !== "Delivered");
  const previousOrders = orders.filter((o) => o.status === "Delivered");

  return (
    <div className="bg-primary font-outfit min-h-screen flex flex-col">
      {/* UPDATED: Use Header and MobileMenu */}
      <Header onMenuToggle={toggleMobileMenu} />
      {isMobileMenuOpen && (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="flex flex-col lg:flex-row gap-8 mx-4 md:mx-8 lg:mx-20 mt-12 mb-20 grow">
        <Sidebar />
        <main className="flex-1 space-y-8">
          <section className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-8">
              Current Orders
            </h2>
            {loading ? (
              <p className="text-gray-500 text-lg">Loading orders...</p>
            ) : currentOrders.length > 0 ? (
              <div className="space-y-6">
                {currentOrders.map((order) => renderOrderCard(order))}
              </div>
            ) : (
              <p className="text-gray-500 text-lg">No current orders.</p>
            )}
          </section>

          <section className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-8">
              Previous Orders
            </h2>
            {loading ? (
              <p className="text-gray-500 text-lg">Loading orders...</p>
            ) : previousOrders.length > 0 ? (
              <div className="space-y-6">
                {previousOrders.map((order) => renderOrderCard(order))}
              </div>
            ) : (
              <p className="text-gray-500 text-lg">No previous orders.</p>
            )}
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
