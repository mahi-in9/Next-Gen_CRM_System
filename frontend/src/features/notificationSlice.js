import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axiosInstance";

/* ===========================================================
   Notification Slice — Production Ready
   =========================================================== */

/* --------------------------- Async Thunks --------------------------- */

// Fetch all notifications (with pagination + optional filter)
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async ({ page = 1, limit = 10, read }, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (read !== undefined) params.read = read;
      const res = await axios.get("/notifications", { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch notifications"
      );
    }
  }
);

// Mark a single notification as read/unread
export const updateNotificationStatus = createAsyncThunk(
  "notifications/updateStatus",
  async ({ id, read }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`/notifications/${id}`, { read });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to update notification"
      );
    }
  }
);

// Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.patch("/notifications/mark-all-read");
      return res.data.message;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to mark all notifications"
      );
    }
  }
);

// Delete a notification
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/notifications/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to delete notification"
      );
    }
  }
);

// (Admin only) Create a new notification manually
export const createNotification = createAsyncThunk(
  "notifications/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post("/notifications", data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to create notification"
      );
    }
  }
);

/* --------------------------- Slice Definition --------------------------- */

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 10,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearNotificationState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- Fetch All ---------- */
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.pagination.total;
        state.page = action.payload.pagination.page;
        state.limit = action.payload.pagination.limit;
        state.totalPages = action.payload.pagination.totalPages;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Update Status ---------- */
      .addCase(updateNotificationStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        state.items = state.items.map((n) =>
          n.id === updated.id ? { ...n, read: updated.read } : n
        );
      })
      .addCase(updateNotificationStatus.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ---------- Mark All Read ---------- */
      .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
        state.items = state.items.map((n) => ({ ...n, read: true }));
        state.successMessage = action.payload;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ---------- Delete ---------- */
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n.id !== action.payload);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ---------- Create (Admin) ---------- */
      .addCase(createNotification.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // add to top
        state.successMessage = "Notification created successfully";
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearNotificationState } = notificationSlice.actions;
export default notificationSlice.reducer;
