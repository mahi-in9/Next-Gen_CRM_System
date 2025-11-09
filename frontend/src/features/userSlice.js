// ==============================================
// userSlice.js — Handles Admin User Management
// ==============================================
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axiosInstance";

// ==============================================
// Thunks (Async Actions)
// ==============================================

// Get all users (Admin only)
export const fetchAllUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/users");
      return res.data.users;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

// Get user by ID (Admin or Self)
export const fetchUserById = createAsyncThunk(
  "users/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/users/${id}`);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

// Update user (Admin or Self)
export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/users/${id}`, data);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update user"
      );
    }
  }
);

// Delete user (Admin only)
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/users/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

// Get all leads of a user
export const fetchUserLeads = createAsyncThunk(
  "users/fetchLeads",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/users/${userId}/leads`);
      return { userId, leads: res.data.leads };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch leads"
      );
    }
  }
);

// Get all activities of a user
export const fetchUserActivities = createAsyncThunk(
  "users/fetchActivities",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/users/${userId}/activities`);
      return { userId, activities: res.data.activities };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch activities"
      );
    }
  }
);

// ==============================================
// Slice
// ==============================================

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    selectedUser: null,
    leads: {},
    activities: {},
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearUserState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ==============================
      // Fetch All Users
      // ==============================
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==============================
      // Fetch User By ID
      // ==============================
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==============================
      // Update User
      // ==============================
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "User updated successfully";

        // Update in local state
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
        if (state.selectedUser?.id === action.payload.id)
          state.selectedUser = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==============================
      // Delete User
      // ==============================
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "User deleted successfully";
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==============================
      // Fetch User Leads
      // ==============================
      .addCase(fetchUserLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserLeads.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, leads } = action.payload;
        state.leads[userId] = leads;
      })
      .addCase(fetchUserLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==============================
      // Fetch User Activities
      // ==============================
      .addCase(fetchUserActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserActivities.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, activities } = action.payload;
        state.activities[userId] = activities;
      })
      .addCase(fetchUserActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ==============================================
// Exports
// ==============================================
export const { clearUserState } = userSlice.actions;
export default userSlice.reducer;
