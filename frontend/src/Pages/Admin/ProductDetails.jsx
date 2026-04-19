import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Loader from "./Components/Loader";
import {
  fetchProductDetails,
  fetchProductMetrics,
  fetchProductCustomers,
  fetchProductRatings,
  updateProduct,
  deleteProduct,
  clearSelectedProduct,
} from "../../store/productsSlice";
import "./admin-styles.css";

/* ----------------- Edit Modal ----------------- */
const EditModal = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    description: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.product_name || "",
        category: product.product_category || "",
        price: product.regular_price || 0,
        stock: product.stock_quantity || 0,
        description: product.product_description || "",
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 admin-modal-backdrop">
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto admin-modal-panel admin-modal-panel-lg">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Edit Product Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
              required
              minLength="3"
              maxLength="100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                required
                minLength="2"
                maxLength="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                required
                min="0"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
              required
              minLength="10"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    selected: product,
    metrics,
    customers,
    ratings,
    avgRating,
    totalRatings,
    loadingDetail,
    loadingMetrics,
    loadingCustomers,
    loadingRatings,
    error,
  } = useSelector((state) => state.products);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      dispatch(fetchProductMetrics(id));
      dispatch(fetchProductCustomers(id));
      dispatch(fetchProductRatings(id));
    }

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  const handleUpdate = async (formData) => {
    const data = new FormData();
    data.append("product_name", formData.name);
    data.append("product_category", formData.category);
    data.append("product_description", formData.description);
    data.append("product_type", "simple");
    data.append("stock_status", formData.stock > 0 ? "in_stock" : "out_of_stock");

    const variants = [{
      regular_price: formData.price,
      stock_quantity: formData.stock,
    }];
    data.append("variants", JSON.stringify(variants));

    const resultAction = await dispatch(updateProduct({ id, formData: data }));
    if (updateProduct.fulfilled.match(resultAction)) {
      alert("Product updated successfully");
      setIsEditModalOpen(false);
      dispatch(fetchProductDetails(id));
      dispatch(fetchProductMetrics(id));
    } else {
      alert(resultAction.payload || "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this Product? This cannot be undone!")) return;

    const resultAction = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(resultAction)) {
      alert("Product deleted successfully");
      navigate("/admin/products");
    } else {
      alert(resultAction.payload || "Failed to delete product");
    }
  };

  if (loadingDetail || loadingMetrics || loadingCustomers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex admin-shell">
        <Sidebar />
        <div className="flex-1 ml-64 admin-content">
          <Header title="Product Details" />
          <div className="p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 premium-hover-card">
              <Loader />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex admin-shell">
        <Sidebar />
        <div className="flex-1 ml-64 admin-content">
          <Header title="Product Details" />
          <div className="p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center premium-hover-card">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Product</h2>
              <p className="text-gray-600 mb-6">Error: {error}</p>
              <button
                onClick={() => navigate("/admin/products")}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex admin-shell">
        <Sidebar />
        <div className="flex-1 ml-64 admin-content">
          <Header title="Product Details" />
          <div className="p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center premium-hover-card">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Product Not Found</h2>
              <p className="text-gray-600 mb-6">The product could not be found.</p>
              <button
                onClick={() => navigate("/admin/products")}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const regularPrice = Number(product.regular_price) || 0;
  const stockQuantity = Number(product.stock_quantity) || 0;
  const productCode = `#PD${String(product.id).slice(-3).padStart(3, "0")}`;
  const totalRevenue = metrics?.revenue || 0;
  const totalSales = metrics?.totalSales || 0;
  const uniqueCustomers = metrics?.uniqueCustomers || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex admin-shell">
      <Sidebar />
      
      <div className="flex-1 ml-64 admin-content">
        <Header title="Product Details" />
        
        <main className="p-6">
          {/* Header with Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/admin/products")}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Products
            </button>
          </div>

          {/* Product Profile */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 premium-hover-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <img
                  src={product.image || "https://via.placeholder.com/150"}
                  alt={product.product_name}
                  className="h-24 w-24 rounded-xl object-cover shadow-lg"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-1">{product.product_name}</h1>
                  {/* Avg Rating Badge */}
                  {totalRatings > 0 ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-bold text-amber-700">{avgRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic mt-1">No ratings yet</p>
                  )}
                  <p className="text-gray-600 text-sm mt-1">{product.product_category}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Edit Product
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>

          {/* Product Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm text-gray-600 uppercase tracking-wider">Price</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">₹{regularPrice.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">
                  💰
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm text-gray-600 uppercase tracking-wider">Stock</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stockQuantity}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                  📦
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm text-gray-600 uppercase tracking-wider">Total Sales</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{totalSales}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  📊
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm text-gray-600 uppercase tracking-wider">Revenue</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">₹{totalRevenue.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                  📈
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 premium-hover-card">
            <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Product ID</p>
                  <p className="text-lg font-semibold text-gray-800">{productCode}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Date Added</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(product.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Shop Owner</p>
                  <p className="text-lg font-semibold text-gray-800">{product.vendor?.store_name || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Vendor Email</p>
                  <p className="text-lg font-semibold text-gray-800">{product.vendor?.email || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Current Stock</p>
                <p className="text-lg font-semibold text-gray-800">{stockQuantity}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Stock Status</p>
                <p className="text-lg font-semibold text-gray-800">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Product Description</h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
              {product.product_description || "No description available"}
            </p>
          </div>

          {/* Purchase History */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Purchase History</h3>
              <span className="px-4 py-2 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                {customers.length} {customers.length === 1 ? 'Purchase' : 'Purchases'}
              </span>
            </div>
            
            {customers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left font-semibold text-gray-700">Order ID</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Customer</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Quantity</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">#{c.order_id}</td>
                        <td className="p-3 font-semibold">{c.customer_name}</td>
                        <td className="p-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            {c.quantity}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-500">{new Date(c.date).toLocaleDateString()}</td>
                        <td className="p-3 font-semibold text-green-600">₹{(c.quantity * regularPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-600">No purchase history available</p>
              </div>
            )}
          </div>

          {/* Customer Ratings */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-800">Customer Ratings</h3>
              <div className="flex items-center gap-3">
                {totalRatings > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span className="text-sm font-bold text-amber-700">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-amber-600">avg</span>
                  </div>
                )}
                <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                  {totalRatings} {totalRatings === 1 ? 'Rating' : 'Ratings'}
                </span>
              </div>
            </div>

            {loadingRatings ? (
              <div className="flex justify-center p-8"><Loader /></div>
            ) : ratings.length === 0 ? (
              <div className="text-center py-10">
                <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No ratings yet for this product</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ratings.map((r) => (
                  <div key={r.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {r.customer?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800 text-sm">{r.customer}</p>
                            {r.isVerifiedPurchase && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">✓ Verified</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {r.date ? new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                        <span className="text-xs font-bold text-gray-600 ml-1">{r.rating}/5</span>
                      </div>
                    </div>
                    {r.title && (
                      <p className="text-sm font-semibold text-gray-800 mb-1">{r.title}</p>
                    )}
                    {r.review && (
                      <p className="text-gray-600 text-sm leading-relaxed bg-white rounded-lg p-3 border border-gray-100">
                        "{r.review}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={product}
          onSave={handleUpdate}
        />
      </div>
    </div>
  );
};

export default ProductDetails;

