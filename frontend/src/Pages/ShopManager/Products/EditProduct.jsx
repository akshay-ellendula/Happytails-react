import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    product_name: "",
    product_category: "",
    product_type: "",
    stock_status: "In Stock",
    product_description: "",
  });
  const [variants, setVariants] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await axiosInstance.get(`/vendors/products/${productId}`);
      if (res.data.success) {
        const p = res.data.product;
        setFormData({
          product_name: p.product_name,
          product_category: p.product_category,
          product_type: p.product_type,
          stock_status: p.stock_status,
          product_description: p.product_description,
        });
        setVariants(p.variants);
        setExistingImages(p.images);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching product details");
      navigate("/shop/products");
    }
  };

  const handleInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleVariant = (i, e) => {
    const newVars = [...variants];
    newVars[i][e.target.name] = e.target.value;
    setVariants(newVars);
  };

  const removeExistingImage = (imageId) => {
    setExistingImages(existingImages.filter((img) => img._id !== imageId));
    setDeletedImages([...deletedImages, imageId]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((k) => data.append(k, formData[k]));
    data.append("variants", JSON.stringify(variants));
    
    // Append deleted images IDs
    deletedImages.forEach((id) => data.append("deletedImages", id));

    // Append new files
    Array.from(newFiles).forEach((f) => data.append("product_images", f));

    try {
      await axiosInstance.put(`/vendors/products/${productId}`, data);
      toast.success("Product updated successfully");
      navigate("/shop/products");
    } catch (err) {
      toast.error("Error updating product");
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Product...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <button
        onClick={() => navigate("/shop/products")}
        className="mb-4 text-gray-500 hover:text-gray-700"
      >
        ← Back to Products
      </button>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Product</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              name="product_name"
              value={formData.product_name}
              onChange={handleInput}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="product_category"
              value={formData.product_category}
              onChange={handleInput}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Select Category</option>
              <option value="food">Food</option>
              <option value="toys">Toys</option>
              <option value="beds">Beds</option>
              <option value="grooming">Grooming</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pet Type</label>
            <select
              name="product_type"
              value={formData.product_type}
              onChange={handleInput}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Select Pet Type</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
            <select
              name="stock_status"
              value={formData.stock_status}
              onChange={handleInput}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="product_description"
            value={formData.product_description}
            onChange={handleInput}
            className="w-full border border-gray-300 p-2 h-32 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
          ></textarea>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold mb-3 text-gray-800">Variants</h3>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div
                key={i}
                className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <input
                  name="size"
                  placeholder="Size (e.g. S, M, 1kg)"
                  value={v.size || ""}
                  onChange={(e) => handleVariant(i, e)}
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="color"
                  placeholder="Color"
                  value={v.color || ""}
                  onChange={(e) => handleVariant(i, e)}
                  className="border p-2 rounded"
                />
                <input
                  name="regular_price"
                  type="number"
                  placeholder="Regular Price"
                  value={v.regular_price}
                  onChange={(e) => handleVariant(i, e)}
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="stock_quantity"
                  type="number"
                  placeholder="Stock Qty"
                  value={v.stock_quantity}
                  onChange={(e) => handleVariant(i, e)}
                  className="border p-2 rounded"
                  required
                />
                <div className="flex items-center justify-end">
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setVariants(variants.filter((_, idx) => idx !== i))
                      }
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setVariants([
                ...variants,
                {
                  size: "",
                  color: "",
                  regular_price: "",
                  sale_price: "",
                  stock_quantity: "",
                },
              ])
            }
            className="mt-3 text-blue-600 font-medium hover:text-blue-800"
          >
            + Add Another Variant
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold mb-3 text-gray-800">Images</h3>
          
          {/* Existing Images */}
          <div className="flex gap-4 mb-4 flex-wrap">
            {existingImages.map((img) => (
              <div key={img._id} className="relative group">
                <img
                  src={img.image_data}
                  alt="Product"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img._id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* New Images Input */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Add New Images (Max 4 total)</label>
          <input
            type="file"
            multiple
            onChange={(e) => setNewFiles(e.target.files)}
            accept="image/*"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
            "
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate("/shop/products")}
            className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
