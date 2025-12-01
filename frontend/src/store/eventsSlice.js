// frontend/src/store/eventsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../utils/axios";

/* ===========================================================
   BACKEND ROUTES (Aligned and optimized)
   -----------------------------------------------------------
   GET    /admin/events/:id          → { success: true, event: {...} }
   GET    /admin/events/:id/attendees → { success: true, attendees: [...] }
   PUT    /admin/events/:id                 → Handles multipart/form-data for thumbnail/banner
   DELETE /admin/events/:id
   =========================================================== */

/* ---------------------- FETCH EVENT DETAILS ---------------------- */
export const fetchEventDetails = createAsyncThunk(
  "events/fetchEventDetails",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/admin/events/${id}`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load event details");
      }
      return res.data.event;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load event details");
    }
  }
);

/* ---------------------- FETCH EVENT ATTENDEES ---------------------- */
export const fetchEventAttendees = createAsyncThunk(
  "events/fetchEventAttendees",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/admin/events/${id}/attendees`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load attendees");
      }
      return res.data.attendees;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load attendees");
    }
  }
);

/* ---------------------- UPDATE EVENT ---------------------- */
export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/admin/events/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!res.data.success) {
        throw new Error(res.data.message || "Event update failed");
      }
      // Assuming backend returns the updated event object for consistency
      return res.data.event || formData; // Fallback to optimistic data if not returned
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Event update failed");
    }
  }
);

/* ---------------------- DELETE EVENT ---------------------- */
export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/admin/events/${id}`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Event delete failed");
      }
      return { id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Event delete failed");
    }
  }
);

const eventsSlice = createSlice({
  name: "events",
  initialState: {
    selected: null,
    attendees: [],

    loadingDetail: false,
    loadingAttendees: false,

    error: null,
  },

  reducers: {
    clearSelectedEvent(state) {
      state.selected = null;
      state.attendees = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ---------------- Event Details ---------------- */
      .addCase(fetchEventDetails.pending, (state) => {
        state.loadingDetail = true;
        state.error = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selected = action.payload;
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload;
      })

      /* ---------------- Attendees ---------------- */
      .addCase(fetchEventAttendees.pending, (state) => {
        state.loadingAttendees = true;
      })
      .addCase(fetchEventAttendees.fulfilled, (state, action) => {
        state.loadingAttendees = false;
        state.attendees = action.payload || [];
      })
      .addCase(fetchEventAttendees.rejected, (state, action) => {
        state.loadingAttendees = false;
        state.error = action.payload;
      })

      /* ---------------- Update Event ---------------- */
      .addCase(updateEvent.fulfilled, (state, action) => {
        if (state.selected) {
          state.selected = { ...state.selected, ...action.payload };
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ---------------- Delete Event ---------------- */
      .addCase(deleteEvent.fulfilled, (state, action) => {
        if (state.selected && String(state.selected.id) === String(action.payload.id)) {
          state.selected = null;
          state.attendees = [];
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearSelectedEvent } = eventsSlice.actions;
export default eventsSlice.reducer;