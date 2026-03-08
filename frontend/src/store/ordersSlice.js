// frontend/src/store/ordersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../utils/axios";

/* ===========================================================
   BACKEND ROUTES
   -----------------------------------------------------------
   GET /admin/orders/:id → { success: true, order: {...} }
   =========================================================== */

/* ---------------------- FETCH ORDER DETAILS ---------------------- */
export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (id, { rejectWithValue }) => {
    try {
      // Note: The EJS file uses /api/admin/order/:id, but the adminRoutes.js uses /admin/orders/:id
      const res = await axiosInstance.get(`/admin/orders/${id}`); 
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load order details");
      }
      return res.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load order details");
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    selected: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearSelectedOrder(state) {
      state.selected = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ---------------- Order Details ---------------- */
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;