import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1/users";

// ======== Async Thunks ========

// Fetch all users
export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth?.token;
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.users;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

// Fetch single user
export const fetchUserById = createAsyncThunk(
  "users/fetchById",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth?.token;
      const res = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth?.token;
      const res = await axios.put(`${API_URL}/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update user"
      );
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth?.token;
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

// ======== Slice ========
const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    currentUser: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })

      // Update
      .addCase(updateUser.fulfilled, (state, action) => {
        state.list = state.list.map((u) =>
          u.id === action.payload.id ? action.payload : u
        );
        if (state.currentUser?.id === action.payload.id)
          state.currentUser = action.payload;
      })

      // Delete
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u.id !== action.payload);
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
