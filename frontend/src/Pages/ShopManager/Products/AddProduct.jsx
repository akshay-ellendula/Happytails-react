import React, { useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { useNavigate } from "react-router-dom";

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

  const handleInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleVariant = (i, e) => {
    const newVars = [...variants];
    newVars[i][e.target.name] = e.target.value;
    setVariants(newVars);
  };
const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((k) => data.append(k, formData[k]));
    
    // Stringify variants for the backend to parse
    data.append("variants", JSON.stringify(variants));
    
    // Append images
    if (files && files.length > 0) {
        Array.from(files).forEach((f) => data.append("product_images", f));
    }

    try {
      // FIX: Add the headers object as the 3rd argument
      await axiosInstance.post("/vendors/products", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/shop/products");
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message); // Better error logging
      alert("Error adding product");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <button
        onClick={() => navigate("/shop/products")}
        className="mb-4 text-gray-500"
      >
        ← Back
      </button>
      <h1 className="text-2xl mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            name="product_name"
            placeholder="Product Name"
            onChange={handleInput}
            className="border p-2 rounded"
            required
          />
          <select
            name="product_category"
            onChange={handleInput}
            className="border p-2 rounded"
            required
          >
            <option value="">Category</option>
            <option value="food">Food</option>
            <option value="toys">Toys</option>
            <option value="beds">Beds</option>
            <option value="grooming">Grooming</option>
          </select>
          <select
            name="product_type"
            onChange={handleInput}
            className="border p-2 rounded"
            required
          >
            <option value="">Pet Type</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
          </select>
          <select
            name="stock_status"
            onChange={handleInput}
            className="border p-2 rounded"
          >
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
        <textarea
          name="product_description"
          placeholder="Description"
          onChange={handleInput}
          className="w-full border p-2 mb-4 h-24 rounded"
          required
        ></textarea>

        <h3 className="font-bold mb-2">Variants</h3>
        {variants.map((v, i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-2 mb-2 bg-gray-50 p-2 rounded"
          >
            <input
              name="size"
              placeholder="Size"
              value={v.size}
              onChange={(e) => handleVariant(i, e)}
              className="border p-2"
              required
            />
            <input
              name="color"
              placeholder="Color"
              value={v.color}
              onChange={(e) => handleVariant(i, e)}
              className="border p-2"
            />
            <input
              name="regular_price"
              type="number"
              placeholder="Price"
              value={v.regular_price}
              onChange={(e) => handleVariant(i, e)}
              className="border p-2"
              required
            />
            <input
              name="stock_quantity"
              type="number"
              placeholder="Stock"
              value={v.stock_quantity}
              onChange={(e) => handleVariant(i, e)}
              className="border p-2"
              required
            />
            {variants.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setVariants(variants.filter((_, idx) => idx !== i))
                }
                className="text-red-500"
              >
                X
              </button>
            )}
          </div>
        ))}
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
          className="text-blue-600 mb-4"
        >
          + Add Variant
        </button>

        <div className="mb-6">
          <label className="block mb-2">Images (Max 4)</label>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            accept="image/*"
            className="border p-2 w-full"
          />
        </div>

        <button type="submit" className="bg-black text-white px-6 py-2 rounded">
          Publish
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
