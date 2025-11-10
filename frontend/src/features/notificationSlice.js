import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

/* ============================================================
   🔄 ASYNC THUNKS
============================================================ */

/**
 * @desc Fetch all notifications for logged-in user
 * @route GET /api/notifications
 */
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/notifications");
      return res.data.notifications;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch notifications"
      );
    }
  }
);

/**
 * @desc Create a new notification
 * @route POST /api/notifications
 */
export const createNotification = createAsyncThunk(
  "notifications/create",
  async ({ userId, type, message }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/notifications", {
        userId,
        type,
        message,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create notification"
      );
    }
  }
);

/**
 * @desc Mark one notification as read
 * @route PATCH /api/notifications/:id/read
 */
export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/notifications/${id}/read`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to mark as read");
    }
  }
);

/**
 * @desc Mark all notifications as read
 * @route PATCH /api/notifications/mark-all-read
 */
export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.patch("/notifications/mark-all-read");
      return true; // indicate success
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to mark all as read"
      );
    }
  }
);

/**
 * @desc Delete a notification
 * @route DELETE /api/notifications/:id
 */
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      return id; // return deleted id for local state removal
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete notification"
      );
    }
  }
);

/* ============================================================
   🧩 SLICE DEFINITION
============================================================ */
const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    loading: false,
    error: null,
    unreadCount: 0,
  },

  reducers: {
    resetNotificationState: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.unreadCount = 0;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ---------- FETCH ---------- */
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- CREATE ---------- */
      .addCase(createNotification.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        if (!action.payload.read) state.unreadCount++;
      })

      /* ---------- MARK ONE READ ---------- */
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.items.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          state.unreadCount = state.items.filter((n) => !n.read).length;
        }
      })

      /* ---------- MARK ALL READ ---------- */
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, read: true }));
        state.unreadCount = 0;
      })

      /* ---------- DELETE ---------- */
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n.id !== action.payload);
        state.unreadCount = state.items.filter((n) => !n.read).length;
      });
  },
});

export const { resetNotificationState } = notificationSlice.actions;
export default notificationSlice.reducer;
