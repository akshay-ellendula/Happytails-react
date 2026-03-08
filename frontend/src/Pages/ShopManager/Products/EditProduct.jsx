/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  X,
  Package,
  Tag,
  DollarSign,
  Hash,
  Grid,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [previewUrls, setPreviewUrls] = useState([]);

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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setNewFiles(selectedFiles);
    
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeExistingImage = (imageId) => {
    setExistingImages(existingImages.filter((img) => img._id !== imageId));
    setDeletedImages([...deletedImages, imageId]);
  };

  const removeNewImage = (index) => {
    const newFilesList = [...newFiles];
    newFilesList.splice(index, 1);
    setNewFiles(newFilesList);
    
    const newUrls = [...previewUrls];
    URL.revokeObjectURL(newUrls[index]);
    newUrls.splice(index, 1);
    setPreviewUrls(newUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const data = new FormData();
    Object.keys(formData).forEach((k) => data.append(k, formData[k]));
    data.append("variants", JSON.stringify(variants));

    deletedImages.forEach((id) => data.append("deletedImages", id));
    Array.from(newFiles).forEach((f) => data.append("product_images", f));

    try {
      await axiosInstance.put(`/vendors/products/${productId}`, data);
      toast.success("Product updated successfully");
      navigate("/shop/products");
    } catch (err) {
      toast.error("Error updating product");
      console.error(err);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone."))
      return;
    
    try {
      await axiosInstance.delete(`/vendors/products/${productId}`);
      toast.success("Product deleted");
      navigate("/shop/products");
    } catch (err) {
      toast.error("Error deleting product");
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Product...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/shop/products")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Products</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-500 mt-1">Update product details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Product ID</p>
            <p className="font-medium text-gray-900">{productId.slice(-8)}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Package className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Tag className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                name="product_name"
                value={formData.product_name}
                onChange={handleInput}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="product_category"
                value={formData.product_category}
                onChange={handleInput}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Type *
              </label>
              <select
                name="product_type"
                value={formData.product_type}
                onChange={handleInput}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              >
                <option value="">Select Pet Type</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Status
              </label>
              <select
                name="stock_status"
                value={formData.stock_status}
                onChange={handleInput}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="product_description"
              value={formData.product_description}
              onChange={handleInput}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-32"
              required
            ></textarea>
          </div>
        </div>

        {/* Variants Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Grid className="text-purple-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Product Variants</h2>
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              + Add Variant
            </button>
          </div>
          
          <div className="space-y-4">
            {variants.map((v, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Variant {i + 1}</h3>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setVariants(variants.filter((_, idx) => idx !== i))
                      }
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Size *</label>
                    <input
                      name="size"
                      placeholder="Size (e.g. S, M, 1kg)"
                      value={v.size || ""}
                      onChange={(e) => handleVariant(i, e)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Color</label>
                    <input
                      name="color"
                      placeholder="Color"
                      value={v.color || ""}
                      onChange={(e) => handleVariant(i, e)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Regular Price *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        name="regular_price"
                        type="number"
                        placeholder="Regular Price"
                        value={v.regular_price}
                        onChange={(e) => handleVariant(i, e)}
                        className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Stock Qty *</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        name="stock_quantity"
                        type="number"
                        placeholder="Stock Qty"
                        value={v.stock_quantity}
                        onChange={(e) => handleVariant(i, e)}
                        className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <div className="w-full">
                      <label className="block text-sm text-gray-600 mb-1">Total Value</label>
                      <div className="p-2 bg-gray-100 rounded-lg text-center">
                        <span className="font-medium text-gray-900">
                          ₹{(v.regular_price * v.stock_quantity || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Images Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-100 rounded-xl">
              <ImageIcon className="text-amber-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Product Images</h2>
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-8">
              <h3 className="font-medium text-gray-900 mb-3">Current Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((img) => (
                  <div key={img._id} className="relative group">
                    <img
                      src={img.image_data}
                      alt="Product"
                      className="w-full h-48 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img._id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Upload */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Add New Images</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors mb-4">
              <Upload className="mx-auto text-gray-400 mb-3" size={32} />
              <p className="text-gray-600 mb-2">Click to upload new images</p>
              <p className="text-sm text-gray-500 mb-4">Max 4 total images including existing</p>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="new-image-upload"
              />
              <label
                htmlFor="new-image-upload"
                className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Select Files
              </label>
            </div>

            {/* New Image Previews */}
            {previewUrls.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">New Image Previews</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`New preview ${index + 1}`}
                        className="w-full h-48 object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        New
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={saving}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-lg transition-all ${
              saving
                ? 'bg-emerald-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:shadow-xl'
            } text-white`}
          >
            {saving ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={24} />
                <span>Save Changes</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => navigate("/shop/products")}
            className="px-8 py-4 bg-white border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleDelete}
            className="px-8 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Trash2 size={20} />
            <span>Delete Product</span>
          </button>
        </div>
      </form>

      {/* Warning Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-600 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-gray-900 mb-2">⚠️ Important Notes</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Deleting images cannot be undone</li>
              <li>• Changing prices won't affect existing orders</li>
              <li>• Update stock quantities to prevent overselling</li>
              <li>• Ensure all variants have valid prices and stock</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;