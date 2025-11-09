import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

/* =======================================================
   🎯 Async Thunk — Fetch Analytics Overview
======================================================= */
export const fetchAnalyticsOverview = createAsyncThunk(
  "analytics/fetchOverview",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/analytics");
      return data; // Contains summary, leadsByStage, topPerformers, recentHistories
    } catch (error) {
      console.error("❌ Analytics Fetch Error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch analytics data"
      );
    }
  }
);

/* =======================================================
   🧩 Slice Definition
======================================================= */
const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    summary: {
      totalLeads: 0,
      totalUsers: 0,
      totalActivities: 0,
      totalHistories: 0,
    },
    leadsByStage: [],
    topPerformers: [],
    recentHistories: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAnalyticsState: (state) => {
      state.summary = {
        totalLeads: 0,
        totalUsers: 0,
        totalActivities: 0,
        totalHistories: 0,
      };
      state.leadsByStage = [];
      state.topPerformers = [];
      state.recentHistories = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------------- Fetch Analytics ----------------
      .addCase(fetchAnalyticsOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary || {};
        state.leadsByStage = action.payload.leadsByStage || [];
        state.topPerformers = action.payload.topPerformers || [];
        state.recentHistories = action.payload.recentHistories || [];
      })
      .addCase(fetchAnalyticsOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to load analytics data";
      });
  },
});

export const { clearAnalyticsState } = analyticsSlice.actions;
export default analyticsSlice.reducer;
