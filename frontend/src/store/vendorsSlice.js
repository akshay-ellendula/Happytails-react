// frontend/src/store/vendorsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../utils/axios";

/* ===========================================================
   BACKEND ROUTES (Confirmed by you)
   -----------------------------------------------------------
   GET    /admin/vendors/:id
   GET    /admin/vendors/:id/products
   GET    /admin/vendors/:id/revenue
   PUT    /admin/vendors/:id
   DELETE /admin/vendors/:id
   =========================================================== */

/* ---------------------- FETCH VENDOR DETAILS ---------------------- */
export const fetchVendorDetails = createAsyncThunk(
  "vendors/fetchVendorDetails",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/admin/vendors/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to load vendor details" },
      );
    }
  },
);

/* ---------------------- FETCH PRODUCTS ---------------------- */
export const fetchVendorProducts = createAsyncThunk(
  "vendors/fetchVendorProducts",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/admin/vendors/${id}/products`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to load products" },
      );
    }
  },
);

/* ---------------------- FETCH REVENUE ---------------------- */
export const fetchVendorRevenue = createAsyncThunk(
  "vendors/fetchVendorRevenue",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/admin/vendors/${id}/revenue`);
      return res.data.metrics; // Backend returns { metrics: ... }
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to load revenue" },
      );
    }
  },
);

/* ---------------------- FETCH ORDERS BY DATE RANGE ---------------------- */
export const fetchVendorOrdersByDateRange = createAsyncThunk(
  "vendors/fetchVendorOrdersByDateRange",
  async ({ id, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await axiosInstance.get(
        `/admin/vendors/${id}/orders-by-date?${params.toString()}`,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to load orders" },
      );
    }
  },
);

/* ---------------------- FETCH ALL VENDOR ORDERS ---------------------- */
export const fetchAllVendorOrders = createAsyncThunk(
  "vendors/fetchAllVendorOrders",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/admin/vendors/${id}/orders-by-date`,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to load orders" },
      );
    }
  },
);

/* ---------------------- UPDATE VENDOR ---------------------- */
export const updateVendor = createAsyncThunk(
  "vendors/updateVendor",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await axiosInstance.put(`/admin/vendors/${id}`, data);
      // API returns success message, not the updated object.
      // Return optimistic data.
      return { ...data, id };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Vendor update failed" },
      );
    }
  },
);

/* ---------------------- DELETE VENDOR ---------------------- */
export const deleteVendor = createAsyncThunk(
  "vendors/deleteVendor",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/admin/vendors/${id}`);
      return { id, res: res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Vendor delete failed" },
      );
    }
  },
);

const vendorsSlice = createSlice({
  name: "vendors",
  initialState: {
    selected: null,
    products: [],
    revenue: null,
    dateRangeOrders: [],
    dateRangeSummary: null,
    dateRangeFilter: { startDate: null, endDate: null },
    allOrders: [],

    loadingDetail: false,
    loadingProducts: false,
    loadingRevenue: false,
    loadingDateRangeOrders: false,
    loadingAllOrders: false,

    error: null,
  },

  reducers: {
    clearSelectedVendor(state) {
      state.selected = null;
      state.products = [];
      state.revenue = null;
      state.dateRangeOrders = [];
      state.dateRangeSummary = null;
      state.error = null;
    },
    clearVendorDateRangeOrders(state) {
      state.dateRangeOrders = [];
      state.dateRangeSummary = null;
      state.dateRangeFilter = { startDate: null, endDate: null };
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------------- Vendor Details ---------------- */
      .addCase(fetchVendorDetails.pending, (state) => {
        state.loadingDetail = true;
        state.error = null;
      })
      .addCase(fetchVendorDetails.fulfilled, (state, action) => {
        state.loadingDetail = false;
        // backend returns: { vendor: {...} }
        state.selected = action.payload.vendor;
      })
      .addCase(fetchVendorDetails.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload?.message || "Error loading vendor details";
      })

      /* ---------------- Products ---------------- */
      .addCase(fetchVendorProducts.pending, (state) => {
        state.loadingProducts = true;
      })
      .addCase(fetchVendorProducts.fulfilled, (state, action) => {
        state.loadingProducts = false;
        // backend returns: { products: [...] }
        state.products = action.payload.products || [];
      })
      .addCase(fetchVendorProducts.rejected, (state, action) => {
        state.loadingProducts = false;
        state.error = action.payload?.message || "Failed to load products";
      })

      /* ---------------- Revenue ---------------- */
      .addCase(fetchVendorRevenue.pending, (state) => {
        state.loadingRevenue = true;
      })
      .addCase(fetchVendorRevenue.fulfilled, (state, action) => {
        state.loadingRevenue = false;
        // We return res.data.metrics directly now
        state.revenue = action.payload;
      })
      .addCase(fetchVendorRevenue.rejected, (state, action) => {
        state.loadingRevenue = false;
        state.error = action.payload?.message || "Failed to load revenue";
      })

      /* ---------------- Date Range Orders ---------------- */
      .addCase(fetchVendorOrdersByDateRange.pending, (state) => {
        state.loadingDateRangeOrders = true;
      })
      .addCase(fetchVendorOrdersByDateRange.fulfilled, (state, action) => {
        state.loadingDateRangeOrders = false;
        state.dateRangeOrders = action.payload.orders || [];
        state.dateRangeSummary = action.payload.summary || {};
        state.dateRangeFilter = action.payload.dateRange || {};
      })
      .addCase(fetchVendorOrdersByDateRange.rejected, (state, action) => {
        state.loadingDateRangeOrders = false;
        state.error = action.payload?.message || "Failed to load orders";
      })

      /* ---------------- All Vendor Orders ---------------- */
      .addCase(fetchAllVendorOrders.pending, (state) => {
        state.loadingAllOrders = true;
      })
      .addCase(fetchAllVendorOrders.fulfilled, (state, action) => {
        state.loadingAllOrders = false;
        state.allOrders = action.payload.orders || [];
      })
      .addCase(fetchAllVendorOrders.rejected, (state, action) => {
        state.loadingAllOrders = false;
        state.error = action.payload?.message || "Failed to load orders";
      })

      /* ---------------- Update Vendor ---------------- */
      .addCase(updateVendor.fulfilled, (state, action) => {
        if (state.selected) {
          state.selected = { ...state.selected, ...action.payload };
        }
      })

      /* ---------------- Delete Vendor ---------------- */
      .addCase(deleteVendor.fulfilled, (state, action) => {
        if (String(state.selected?._id) === String(action.payload.id)) {
          state.selected = null;
          state.products = [];
          state.revenue = null;
        }
      });
  },
});

export const { clearSelectedVendor, clearVendorDateRangeOrders } = vendorsSlice.actions;
export default vendorsSlice.reducer;
