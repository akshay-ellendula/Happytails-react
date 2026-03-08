// frontend/src/store/eventManagersSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../utils/axios";

/* ===========================================================
   BACKEND ROUTES (Aligned and optimized)
   -----------------------------------------------------------
   GET    /admin/event-managers/:id          → { success: true, manager: {...} }
   GET    /admin/event-managers/:id/metrics → { success: true, metrics: {...} }
   GET    /admin/event-managers/:id/upcoming-events → { success: true, events: [...] }
   GET    /admin/event-managers/:id/past-events     → { success: true, events: [...] }
   PUT    /admin/event-managers/:id                 → Handles multipart/form-data for profilePic
   DELETE /admin/event-managers/:id
   =========================================================== */

/* ---------------------- FETCH EVENT MANAGER DETAILS ---------------------- */
export const fetchEventManagerDetails = createAsyncThunk(
  "eventManagers/fetchEventManagerDetails",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/admin/event-managers/${id}`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load event manager details");
      }
      return res.data.manager;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load event manager details");
    }
  }
);

/* ---------------------- FETCH METRICS ---------------------- */
export const fetchEventManagerMetrics = createAsyncThunk(
  "eventManagers/fetchEventManagerMetrics",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/admin/event-managers/${id}/metrics`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load metrics");
      }
      return res.data.metrics;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load metrics");
    }
  }
);

/* ---------------------- FETCH UPCOMING EVENTS ---------------------- */
export const fetchUpcomingEvents = createAsyncThunk(
  "eventManagers/fetchUpcomingEvents",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/admin/event-managers/${id}/upcoming-events`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load upcoming events");
      }
      return res.data.events;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load upcoming events");
    }
  }
);

/* ---------------------- FETCH PAST EVENTS ---------------------- */
export const fetchPastEvents = createAsyncThunk(
  "eventManagers/fetchPastEvents",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/admin/event-managers/${id}/past-events`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load past events");
      }
      return res.data.events;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load past events");
    }
  }
);

/* ---------------------- UPDATE EVENT MANAGER ---------------------- */
export const updateEventManager = createAsyncThunk(
  "eventManagers/updateEventManager",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/admin/event-managers/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!res.data.success) {
        throw new Error(res.data.message || "Event manager update failed");
      }
      // Assuming backend returns the updated manager object for consistency
      return res.data.manager || formData; // Fallback to optimistic data if not returned
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Event manager update failed");
    }
  }
);

/* ---------------------- DELETE EVENT MANAGER ---------------------- */
export const deleteEventManager = createAsyncThunk(
  "eventManagers/deleteEventManager",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/admin/event-managers/${id}`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Event manager delete failed");
      }
      return { id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Event manager delete failed");
    }
  }
);

const eventManagersSlice = createSlice({
  name: "eventManagers",
  initialState: {
    selected: null,
    metrics: null,
    upcomingEvents: [],
    pastEvents: [],

    loadingDetail: false,
    loadingMetrics: false,
    loadingUpcoming: false,
    loadingPast: false,

    error: null,
  },

  reducers: {
    clearSelectedEventManager(state) {
      state.selected = null;
      state.metrics = null;
      state.upcomingEvents = [];
      state.pastEvents = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ---------------- Event Manager Details ---------------- */
      .addCase(fetchEventManagerDetails.pending, (state) => {
        state.loadingDetail = true;
        state.error = null;
      })
      .addCase(fetchEventManagerDetails.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selected = action.payload;
      })
      .addCase(fetchEventManagerDetails.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload;
      })

      /* ---------------- Metrics ---------------- */
      .addCase(fetchEventManagerMetrics.pending, (state) => {
        state.loadingMetrics = true;
      })
      .addCase(fetchEventManagerMetrics.fulfilled, (state, action) => {
        state.loadingMetrics = false;
        state.metrics = action.payload;
      })
      .addCase(fetchEventManagerMetrics.rejected, (state, action) => {
        state.loadingMetrics = false;
        state.error = action.payload;
      })

      /* ---------------- Upcoming Events ---------------- */
      .addCase(fetchUpcomingEvents.pending, (state) => {
        state.loadingUpcoming = true;
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.loadingUpcoming = false;
        state.upcomingEvents = action.payload || [];
      })
      .addCase(fetchUpcomingEvents.rejected, (state, action) => {
        state.loadingUpcoming = false;
        state.error = action.payload;
      })

      /* ---------------- Past Events ---------------- */
      .addCase(fetchPastEvents.pending, (state) => {
        state.loadingPast = true;
      })
      .addCase(fetchPastEvents.fulfilled, (state, action) => {
        state.loadingPast = false;
        state.pastEvents = action.payload || [];
      })
      .addCase(fetchPastEvents.rejected, (state, action) => {
        state.loadingPast = false;
        state.error = action.payload;
      })

      /* ---------------- Update Event Manager ---------------- */
      .addCase(updateEventManager.fulfilled, (state, action) => {
        if (state.selected) {
          state.selected = { ...state.selected, ...action.payload };
        }
      })
      .addCase(updateEventManager.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ---------------- Delete Event Manager ---------------- */
      .addCase(deleteEventManager.fulfilled, (state, action) => {
        if (state.selected && String(state.selected._id) === String(action.payload.id)) {
          state.selected = null;
          state.metrics = null;
          state.upcomingEvents = [];
          state.pastEvents = [];
        }
      })
      .addCase(deleteEventManager.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearSelectedEventManager } = eventManagersSlice.actions;
export default eventManagersSlice.reducer;