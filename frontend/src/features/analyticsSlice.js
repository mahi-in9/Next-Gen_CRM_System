import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

/* =======================================================
   🎯 Fetch Analytics Overview
======================================================= */
export const fetchAnalyticsOverview = createAsyncThunk(
  "analytics/fetchOverview",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/analytics");
      return data; // { summary, dealsByStage, topPerformers, recentHistories }
    } catch (error) {
      console.error("❌ Analytics Fetch Error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch analytics data"
      );
    }
  }
);

/* =======================================================
   🧩 Slice
======================================================= */
const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    summary: {
      totalDeals: 0,
      totalUsers: 0,
      totalTasks: 0,
      totalSystemLogs: 0,
    },
    dealsByStage: [],
    topPerformers: [],
    recentHistories: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAnalyticsState: (state) => {
      state.summary = {
        totalDeals: 0,
        totalUsers: 0,
        totalTasks: 0,
        totalSystemLogs: 0,
      };
      state.dealsByStage = [];
      state.topPerformers = [];
      state.recentHistories = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary || {};
        state.dealsByStage = action.payload.dealsByStage || [];
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
