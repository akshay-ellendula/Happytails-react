import React, { useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Package,
  Tag,
  DollarSign,
  Hash,
  Palette,
  Grid,
  Plus,
  X,
  Image as ImageIcon,
  CheckCircle
} from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    product_name: "",
    product_category: "",
    product_type: "",
    stock_status: "In Stock",
    product_description: "",
  });
  const [variants, setVariants] = useState([
    {
      size: "",
      color: "",
      regular_price: "",
      sale_price: "",
      stock_quantity: "",
    },
  ]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleVariant = (i, e) => {
    const newVars = [...variants];
    newVars[i][e.target.name] = e.target.value;
    setVariants(newVars);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // Create preview URLs
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removePreview = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    const newUrls = [...previewUrls];
    URL.revokeObjectURL(newUrls[index]);
    newUrls.splice(index, 1);
    setPreviewUrls(newUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    const data = new FormData();
    Object.keys(formData).forEach((k) => data.append(k, formData[k]));
    
    data.append("variants", JSON.stringify(variants));
    
    if (files && files.length > 0) {
      Array.from(files).forEach((f) => data.append("product_images", f));
    }

    try {
      await axiosInstance.post("/vendors/products", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Show success animation
      setTimeout(() => {
        navigate("/shop/products");
      }, 1000);
      
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      alert("Error adding product");
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/shop/products")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-500 mt-1">Create a new product listing</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Package className="text-emerald-600" size={24} />
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
                placeholder="Enter product name"
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
                onChange={handleInput}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              >
                <option value="">Select Category</option>
                <option value="food">Food</option>
                <option value="toys">Toys</option>
                <option value="beds">Beds</option>
                <option value="grooming">Grooming</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Type *
              </label>
              <select
                name="product_type"
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
              placeholder="Enter product description"
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
              <Plus size={18} />
              <span>Add Variant</span>
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
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Size *</label>
                    <input
                      name="size"
                      placeholder="e.g., S, M, 1kg"
                      value={v.size}
                      onChange={(e) => handleVariant(i, e)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Color</label>
                    <div className="flex gap-2">
                      <input
                        name="color"
                        placeholder="Color"
                        value={v.color}
                        onChange={(e) => handleVariant(i, e)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      {v.color && (
                        <div
                          className="w-10 h-10 rounded-lg border"
                          style={{ backgroundColor: v.color }}
                          title={v.color}
                        ></div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Price (₹) *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        name="regular_price"
                        type="number"
                        placeholder="Price"
                        value={v.regular_price}
                        onChange={(e) => handleVariant(i, e)}
                        className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Stock Quantity *</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        name="stock_quantity"
                        type="number"
                        placeholder="Quantity"
                        value={v.stock_quantity}
                        onChange={(e) => handleVariant(i, e)}
                        className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
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
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload Images (Max 4 images)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
              <Upload className="mx-auto text-gray-400 mb-3" size={32} />
              <p className="text-gray-600 mb-2">Drag & drop images here or click to browse</p>
              <p className="text-sm text-gray-500 mb-4">Supports JPG, PNG, WEBP (Max 5MB each)</p>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Browse Files
              </label>
            </div>
          </div>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Image Previews ({previewUrls.length}/4)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-48 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePreview(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Preview {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={uploading}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-lg transition-all ${
              uploading
                ? 'bg-emerald-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:shadow-xl'
            } text-white`}
          >
            {uploading ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Publishing Product...</span>
              </>
            ) : (
              <>
                <CheckCircle size={24} />
                <span>Publish Product</span>
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
        </div>
      </form>

      {/* Quick Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
        <h3 className="font-bold text-gray-900 mb-3">📝 Quick Tips</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Use clear, high-quality images for better conversion</li>
          <li>• Fill all variant details for better customer experience</li>
          <li>• Add detailed descriptions to reduce return rates</li>
          <li>• Set accurate stock quantities to avoid overselling</li>
        </ul>
      </div>
    </div>
  );
};

export default AddProduct;