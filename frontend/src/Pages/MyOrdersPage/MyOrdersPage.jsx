import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import MobileMenu from "../../components/MobileMenu";
import Sidebar from "../ProfilePage/components/Sidebar";
import Footer from "../../components/Footer";
import { axiosInstance } from "../../utils/axios";
import { useNavigate } from "react-router";
import RatingModal from "../../components/RatingModal";
import { toast } from "react-hot-toast";

const PaginationControls = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button 
        onClick={() => {
          onPageChange(currentPage - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
        disabled={currentPage === 1}
        className="px-4 py-2 border-2 border-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 font-semibold transition-colors bg-white text-black text-sm"
      >
        Previous
      </button>
      <span className="font-semibold text-md text-black">Page {currentPage} of {totalPages}</span>
      <button 
        onClick={() => {
          onPageChange(currentPage + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
        disabled={currentPage === totalPages}
        className="px-4 py-2 border-2 border-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 font-semibold transition-colors bg-white text-black text-sm"
      >
        Next
      </button>
    </div>
  );
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRatings, setUserRatings] = useState({}); // Key: product_id, Value: rating object
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProductForRating, setSelectedProductForRating] = useState(null);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const [previousOrdersPage, setPreviousOrdersPage] = useState(1);
  const itemsPerPage = 4;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTrackOrder = (order) => {
    navigate(`/track-order/${order.id || order._id}`, { state: { order } });
  };

  // Fetch user's existing ratings (indexed by product_id)
  const fetchUserRatings = async () => {
    try {
      const response = await axiosInstance.get("/ratings/my-ratings");
      if (response.data.success) {
        const ratingsMap = {};
        response.data.ratings.forEach(rating => {
          // Key by product_id only - customer can only rate each product once
          const productId = rating.product_id._id || rating.product_id;
          ratingsMap[productId] = rating;
        });
        setUserRatings(ratingsMap);
      }
    } catch (error) {
      console.error("Error fetching user ratings:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUserRatings();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get("/products/getUserOrders");
      const data = res.data;

      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error("Error fetching orders: " + data.message);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error(
        "Error fetching orders: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

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
        toast.success("Items added to cart successfully!");
        window.location.href = "/pet_accessory";
      } else toast.error("Error reordering: " + data.message);
    } catch (err) {
      console.error(err);
      toast.error(
        "Error adding items to cart: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleRateProduct = (order, product) => {
    setSelectedOrderForRating(order);
    setSelectedProductForRating({
      id: product.product_id || product._id,
      product_name: product.product_name,
      image_data: product.image_data,
      variant_id: product.variant_id
    });
    setShowRatingModal(true);
  };

  const handleRatingSuccess = (rating) => {
    toast.success("Thank you for your rating!");
    // Update the local state to mark this product as rated
    setUserRatings(prev => ({
      ...prev,
      [rating.product_id]: rating
    }));
  };

  // Check if product can be rated (order delivered AND product not rated before)
  const canRateProduct = (order, productId) => {
    if (order.status !== "Delivered") return false;
    return !userRatings[productId];
  };

  const renderOrderCard = (order) => {
    if (!order.items || order.items.length === 0) return null;
    const item = order.items[0];
    let imageSrc = "";

    if (item?.image_data) {
      if (
        item.image_data.startsWith("data:") ||
        item.image_data.startsWith("http")
      ) {
        imageSrc = item.image_data;
      } else if (!item.image_data.startsWith("/images/")) {
        imageSrc = `data:image/jpeg;base64,${item.image_data}`;
      } else {
        imageSrc = item.image_data;
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
        const evt = (order.timeline || []).find(
          (t) =>
            (t.status && t.status.toLowerCase().includes("out")) ||
            (t.status && t.status.toLowerCase().includes("deliv"))
        );
        if (evt && evt.date) return formatDate(evt.date);
        return "N/A";
      }
      try {
        const base = order.order_date ? new Date(order.order_date) : new Date();
        const expected = new Date(base);
        expected.setDate(expected.getDate() + 10);
        return `Est: ${expected.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      } catch (e) {
        return "Est: N/A";
      }
    };

    const isProductRated = userRatings[item?.product_id];
    const canRate = canRateProduct(order, item?.product_id);

    return (
      <div
        key={order.id || order._id}
        className="border-2 border-black rounded-2xl p-6 hover:shadow-xl transition-all duration-300 bg-white"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image */}
          <div className="shrink-0">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-[#1a1a1a]">
                {order.status === "Delivered"
                  ? `Delivered on ${getDeliveryDisplay(order, true)}`
                  : "Order Placed"}
              </h3>
            </div>
            <div className="w-56 h-56 mx-auto bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-black">
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
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                {item.product_name}{" "}
                {order.items.length > 1 && (
                  <span className="text-gray-600 text-lg">
                    and {order.items.length - 1} more
                  </span>
                )}
              </h2>
              <div className="space-y-2 mb-6">
                <p className="text-gray-700">
                  <span className="font-bold text-[#1a1a1a]">Order ID:</span>{" "}
                  {order.id || order._id}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold text-[#1a1a1a]">Order Date:</span>{" "}
                  {new Date(order.order_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold text-[#1a1a1a]">Delivery Date:</span>{" "}
                  {order.status === "Delivered"
                    ? getDeliveryDisplay(order, true)
                    : getDeliveryDisplay(order, false)}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold text-[#1a1a1a]">Status:</span>{" "}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border border-black ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Shipped"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-[#f2c737] text-[#1a1a1a]"
                    }`}
                  >
                    {order.status}
                  </span>
                </p>
                {isProductRated && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ You have rated this product
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleBuyAgain(order.id || order._id)}
                className="bg-[#1a1a1a] text-[#f2c737] px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-[#f2c737] hover:text-[#1a1a1a] border border-black"
              >
                Buy Again
              </button>
              <button
                onClick={() => handleTrackOrder(order)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg border border-black"
              >
                Order Details
              </button>
              {order.status === "Delivered" && item && (
                <button
                  onClick={() => handleRateProduct(order, item)}
                  disabled={!canRate}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-black ${
                    !canRate
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:scale-105 hover:shadow-lg"
                  }`}
                  title={isProductRated ? "You have already rated this product" : "Rate this product"}
                >
                  {isProductRated ? "Already Rated" : "Rate Product"}
                </button>
              )}
              {order.status === "Delivered" && (
                <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg border border-black">
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

  const paginatedCurrentOrders = currentOrders.slice((currentOrdersPage - 1) * itemsPerPage, currentOrdersPage * itemsPerPage);
  const paginatedPreviousOrders = previousOrders.slice((previousOrdersPage - 1) * itemsPerPage, previousOrdersPage * itemsPerPage);

  return (
    <div className="bg-[#f2c737] font-outfit min-h-screen flex flex-col">
      <Header onMenuToggle={toggleMobileMenu} />
      {isMobileMenuOpen && (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="flex flex-col lg:flex-row gap-8 mx-4 md:mx-8 lg:mx-20 mt-12 mb-20 grow">
        <Sidebar activePage="orders" />
        <main className="flex-1 space-y-8">
          <section className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border-2 border-black">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-8">
              Current Orders
            </h2>
            {loading ? (
              <p className="text-gray-500 text-lg">Loading orders...</p>
            ) : currentOrders.length > 0 ? (
              <div className="space-y-6">
                {paginatedCurrentOrders.map((order) => renderOrderCard(order))}
                <PaginationControls 
                  currentPage={currentOrdersPage} 
                  totalItems={currentOrders.length} 
                  itemsPerPage={itemsPerPage} 
                  onPageChange={setCurrentOrdersPage} 
                />
              </div>
            ) : (
              <p className="text-gray-500 text-lg">No current orders.</p>
            )}
          </section>

          <section className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border-2 border-black">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-8">
              Previous Orders
            </h2>
            {loading ? (
              <p className="text-gray-500 text-lg">Loading orders...</p>
            ) : previousOrders.length > 0 ? (
              <div className="space-y-6">
                {paginatedPreviousOrders.map((order) => renderOrderCard(order))}
                <PaginationControls 
                  currentPage={previousOrdersPage} 
                  totalItems={previousOrders.length} 
                  itemsPerPage={itemsPerPage} 
                  onPageChange={setPreviousOrdersPage} 
                />
              </div>
            ) : (
              <p className="text-gray-500 text-lg">No previous orders.</p>
            )}
          </section>
        </main>
      </div>

      {/* Rating Modal */}
      {selectedProductForRating && selectedOrderForRating && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedProductForRating(null);
            setSelectedOrderForRating(null);
          }}
          product={selectedProductForRating}
          orderId={selectedOrderForRating.id || selectedOrderForRating._id}
          onSuccess={handleRatingSuccess}
        />
      )}

      <Footer />
    </div>
  );
}