import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance"; // ✅ corrected path
// import { socket } from "../../sockets/socketClient"; // optional: keep for future realtime

/* ===========================================================
   🎯 ASYNC THUNKS
=========================================================== */

// ✅ Fetch all activities (for admin/global view)
export const fetchActivities = createAsyncThunk(
  "activities/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/activities");
      return data.activities;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch activities"
      );
    }
  }
);

// ✅ Fetch activities for specific lead
export const fetchLeadActivities = createAsyncThunk(
  "activities/fetchLead",
  async (leadId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/activities/lead/${leadId}`);
      return data.activities;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lead activities"
      );
    }
  }
);

// ✅ Create new activity
export const createActivity = createAsyncThunk(
  "activities/create",
  async (activityData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/activities", activityData);
      return data.activity;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create activity"
      );
    }
  }
);

export const updateActivity = createAsyncThunk(
  "activities/update",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/activities/${id}`, updates);
      return data.activity;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update activity"
      );
    }
  }
);

export const deleteActivity = createAsyncThunk(
  "activities/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/activities/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete activity"
      );
    }
  }
);

/* ===========================================================
   🧩 SLICE DEFINITION
=========================================================== */

const activitySlice = createSlice({
  name: "activities",
  initialState: {
    items: [], // list of activities
    loading: false,
    error: null,
  },
  reducers: {
    // Realtime activity additions (from socket.io)
    addActivityRealtime: (state, action) => {
      state.items.unshift(action.payload);
    },
    // Realtime activity deletion (from socket.io)
    removeActivityRealtime: (state, action) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
    clearActivities: (state) => {
      state.items = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch lead activities
      .addCase(fetchLeadActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLeadActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create new activity
      .addCase(createActivity.pending, (state) => {
        state.loading = true;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
      })
      .addCase(updateActivity.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export const { addActivityRealtime, removeActivityRealtime, clearActivities } =
  activitySlice.actions;

export default activitySlice.reducer;
