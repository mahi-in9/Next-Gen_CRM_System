import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

/* =========================================================
   ⚙️  Async Thunks
========================================================= */

/**
 * Fetch system history logs with pagination, search, and filters.
 * GET /api/history?page=&limit=&action=&entityType=&search=&sort=
 */
export const fetchHistory = createAsyncThunk(
  "history/fetchHistory",
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        page = 1,
        limit = 20,
        action,
        entityType,
        search,
        sort = "desc",
      } = params;
      const query = new URLSearchParams({
        page,
        limit,
        ...(action && { action }),
        ...(entityType && { entityType }),
        ...(search && { search }),
        sort,
      }).toString();

      const res = await axiosInstance.get(`/history?${query}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch system history."
      );
    }
  }
);

/**
 * Create new history log (used internally for backend events).
 * POST /api/history
 */
export const createHistory = createAsyncThunk(
  "history/createHistory",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/history", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create history log."
      );
    }
  }
);

/**
 * Delete selected or all history records.
 * DELETE /api/history
 */
export const deleteHistory = createAsyncThunk(
  "history/deleteHistory",
  async (ids = [], { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete("/history", { data: { ids } });
      return res.data.message;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete history records."
      );
    }
  }
);

/**
 * Cleanup old logs (> 90 days).
 * DELETE /api/history/cleanup
 */
export const cleanupOldHistory = createAsyncThunk(
  "history/cleanupOld",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete("/history/cleanup");
      return res.data.message;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to clean old history records."
      );
    }
  }
);

/* =========================================================
   🧩  Slice Definition
========================================================= */

const historySlice = createSlice({
  name: "history",
  initialState: {
    logs: [],
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 20,
    filters: { action: "", entityType: "", search: "", sort: "desc" },
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- FETCH ---------- */
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        const { logs, total, page, limit, totalPages } = action.payload;
        state.logs = logs;
        state.total = total;
        state.page = page;
        state.limit = limit;
        state.totalPages = totalPages;
        state.loading = false;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- CREATE ---------- */
      .addCase(createHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHistory.fulfilled, (state, action) => {
        state.logs.unshift(action.payload); // Add to top
        state.loading = false;
        state.successMessage = "History log created.";
      })
      .addCase(createHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- DELETE ---------- */
      .addCase(deleteHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(deleteHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- CLEANUP ---------- */
      .addCase(cleanupOldHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(cleanupOldHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(cleanupOldHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* =========================================================
   🧭  Exports
========================================================= */

export const { setFilters, clearMessages } = historySlice.actions;
export default historySlice.reducer;
