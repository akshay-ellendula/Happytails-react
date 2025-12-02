// frontend/src/store/productsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../utils/axios";

/* ===========================================================
   BACKEND ROUTES
   -----------------------------------------------------------
   GET    /admin/products/:id          → { success: true, product: {...} }
   GET    /admin/products/:id/data     → { success: true, metrics: {...} }
   GET    /admin/products/:id/customers → { success: true, customers: [...] }
   PUT    /admin/products/:id          → Handles multipart/form-data for images
   DELETE /admin/products/:id
   =========================================================== */

/* ---------------------- FETCH PRODUCT DETAILS ---------------------- */
export const fetchProductDetails = createAsyncThunk(
  "products/fetchProductDetails",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/admin/products/${id}`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load product details");
      }
      return res.data.product;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load product details");
    }
  }
);

/* ---------------------- FETCH PRODUCT METRICS ---------------------- */
export const fetchProductMetrics = createAsyncThunk(
  "products/fetchProductMetrics",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/admin/products/${id}/data`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load metrics");
      }
      return res.data.metrics;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load metrics");
    }
  }
);

/* ---------------------- FETCH PRODUCT CUSTOMERS ---------------------- */
export const fetchProductCustomers = createAsyncThunk(
  "products/fetchProductCustomers",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/admin/products/${id}/customers`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load customers");
      }
      return res.data.customers;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load customers");
    }
  }
);

/* ---------------------- UPDATE PRODUCT ---------------------- */
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/admin/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!res.data.success) {
        throw new Error(res.data.message || "Product update failed");
      }
      return res.data.product;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Product update failed");
    }
  }
);

/* ---------------------- DELETE PRODUCT ---------------------- */
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/admin/products/${id}`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Product delete failed");
      }
      return { id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Product delete failed");
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    selected: null,
    metrics: null,
    customers: [],

    loadingDetail: false,
    loadingMetrics: false,
    loadingCustomers: false,

    error: null,
  },

  reducers: {
    clearSelectedProduct(state) {
      state.selected = null;
      state.metrics = null;
      state.customers = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ---------------- Product Details ---------------- */
      .addCase(fetchProductDetails.pending, (state) => {
        state.loadingDetail = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selected = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload;
      })

      /* ---------------- Metrics ---------------- */
      .addCase(fetchProductMetrics.pending, (state) => {
        state.loadingMetrics = true;
      })
      .addCase(fetchProductMetrics.fulfilled, (state, action) => {
        state.loadingMetrics = false;
        state.metrics = action.payload || {};
      })
      .addCase(fetchProductMetrics.rejected, (state, action) => {
        state.loadingMetrics = false;
        state.error = action.payload;
      })

      /* ---------------- Customers ---------------- */
      .addCase(fetchProductCustomers.pending, (state) => {
        state.loadingCustomers = true;
      })
      .addCase(fetchProductCustomers.fulfilled, (state, action) => {
        state.loadingCustomers = false;
        state.customers = action.payload || [];
      })
      .addCase(fetchProductCustomers.rejected, (state, action) => {
        state.loadingCustomers = false;
        state.error = action.payload;
      })

      /* ---------------- Update Product ---------------- */
      .addCase(updateProduct.fulfilled, (state, action) => {
        if (state.selected) {
          state.selected = { ...state.selected, ...action.payload };
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ---------------- Delete Product ---------------- */
      .addCase(deleteProduct.fulfilled, (state, action) => {
        if (state.selected && String(state.selected.id) === String(action.payload.id)) {
          state.selected = null;
          state.metrics = null;
          state.customers = [];
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;