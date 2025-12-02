// src/Pages/Admin/ProductDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductDetails,
  fetchProductMetrics,
  fetchProductCustomers,
  updateProduct,
  deleteProduct,
  clearSelectedProduct,
} from "../../store/productsSlice";
import { Loader2 } from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux State
  const {
    selected: product,
    metrics,
    customers,
    loadingDetail,
    loadingMetrics,
    loadingCustomers,
    error,
  } = useSelector((state) => state.products);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    sku: "",
    brand: "",
    description: "",
    images: [],
  });

  // Fetch Data on Mount
  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      dispatch(fetchProductMetrics(id));
      dispatch(fetchProductCustomers(id));
    }

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  // Update local form data when product details are loaded
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.product_name || "",
        category: product.product_category || "",
        price: product.regular_price || 0,
        stock: product.stock_quantity || 0,
        sku: product.sku || "",
        brand: product.brand || "",
        description: product.product_description || "",
        images: [],
      });
    }
  }, [product]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("product_name", formData.name);
    data.append("product_category", formData.category);
    data.append("regular_price", formData.price);
    data.append("stock_quantity", formData.stock);
    data.append("sku", formData.sku);
    data.append("brand", formData.brand);
    data.append("product_description", formData.description);
    formData.images.forEach((image) => data.append("images", image));

    const resultAction = await dispatch(updateProduct({ id, formData: data }));
    if (updateProduct.fulfilled.match(resultAction)) {
      alert("Product updated successfully");
      setIsEditing(false);
      dispatch(fetchProductDetails(id));
      dispatch(fetchProductMetrics(id));
    } else {
      alert(resultAction.payload || "Update failed");
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Delete this Product? This cannot be undone!"
      )
    )
      return;

    const resultAction = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(resultAction)) {
      alert("Product deleted successfully");
      navigate("/admin/products");
    } else {
      alert(resultAction.payload || "Failed to delete product");
    }
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files) });
  };

  if (loadingDetail || loadingMetrics || loadingCustomers) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 text-xl mb-4">Error: {error}</p>
        <button
          onClick={() => navigate("/admin/products")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  if (!product) return <div className="p-10 text-center text-2xl">Product not found</div>;

  // Safe calculations
  const regularPrice = Number(product.regular_price) || 0;
  const stockQuantity = Number(product.stock_quantity) || 0;

  // Edit View
  if (isEditing) {
    return (
      <div className="max-w-5xl mx-auto p-5 bg-gray-100 min-h-screen font-sans text-gray-800">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-[#6495ed] border-b pb-2 mb-4">
            Edit Product Information
          </h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="form-group">
              <label>Product Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                minLength="3"
                maxLength="100"
              />
            </div>
            <div className="form-group">
              <label>Category:</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                minLength="2"
                maxLength="50"
              />
            </div>
            <div className="form-group">
              <label>Price (₹):</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Current Stock:</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label>SKU:</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                maxLength="50"
              />
            </div>
            <div className="form-group">
              <label>Brand:</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                maxLength="50"
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                minLength="10"
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>Upload New Images (up to 5):</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // View Mode
  return (
    <div className="max-w-5xl mx-auto p-5 bg-gray-100 min-h-screen font-sans text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate("/admin/products")} className="text-blue-600 hover:underline">
          ← Back to Products
        </button>
        <div>
          <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2">
            Edit Product
          </button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Delete Product
          </button>
        </div>
      </div>

      {/* Product Profile */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 flex items-start">
        <img
          src={product.image || "https://via.placeholder.com/150"}
          alt={product.product_name}
          className="w-32 h-32 object-cover rounded mr-6"
        />
        <div>
          <h2 className="text-2xl font-bold mb-2">{product.product_name}</h2>
          <p className="text-gray-600">{product.product_category}</p>
          <p className="text-xl font-semibold text-green-600">₹{regularPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Product Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#6495ed] border-b pb-2 mb-4">Product Information</h3>
        <table className="w-full">
          <tbody>
            <tr><td className="font-semibold w-1/3">Product ID:</td><td>#{product.id}</td></tr>
            <tr><td className="font-semibold">Date Added:</td><td>{new Date(product.created_at).toLocaleDateString()}</td></tr>
            <tr><td className="font-semibold">Shop Owner:</td><td>{product.vendor?.store_name || "N/A"}</td></tr>
            <tr><td className="font-semibold">Vendor Email:</td><td>{product.vendor?.email || "N/A"}</td></tr>
            <tr><td className="font-semibold">Current Stock:</td><td>{stockQuantity}</td></tr>
            <tr><td className="font-semibold">SKU:</td><td>{product.sku || "N/A"}</td></tr>
            <tr><td className="font-semibold">Brand:</td><td>{product.brand || "N/A"}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Product Description */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#6495ed] border-b pb-2 mb-4">Product Description</h3>
        <p>{product.product_description || "No description available"}</p>
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#6495ed] border-b pb-2 mb-4">Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{metrics.totalSales || 0}</p>
            <p className="text-gray-500">Total Sales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">₹{(metrics.revenue || 0).toFixed(2)}</p>
            <p className="text-gray-500">Revenue Generated</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{metrics.uniqueCustomers || 0}</p>
            <p className="text-gray-500">Unique Customers</p>
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-[#6495ed] border-b pb-2 mb-4">Purchase History</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 font-semibold text-sm">Order ID</th>
                <th className="p-2 font-semibold text-sm">Customer</th>
                <th className="p-2 font-semibold text-sm">Quantity</th>
                <th className="p-2 font-semibold text-sm">Date</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((c, index) => (
                  <tr key={index} className="hover:bg-blue-50">
                    <td className="p-2 border-b border-gray-100 text-sm">#{c.order_id}</td>
                    <td className="p-2 border-b border-gray-100 text-sm">{c.customer_name}</td>
                    <td className="p-2 border-b border-gray-100 text-sm">{c.quantity}</td>
                    <td className="p-2 border-b border-gray-100 text-sm">{new Date(c.date).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500 text-sm">No purchase history</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;