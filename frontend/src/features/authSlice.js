import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

/* ------------------------- Thunks ------------------------- */

// Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/login", credentials);
      const { accessToken, refreshToken, user } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;

      return { user, accessToken, refreshToken };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Login failed");
    }
  }
);

// Register
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/register", data);
      const { accessToken, refreshToken, user } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;

      return { user, accessToken, refreshToken };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Registration failed"
      );
    }
  }
);

// Refresh Token
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token found");

      const res = await axiosInstance.post("/auth/refresh", { refreshToken });
      const { accessToken } = res.data;

      localStorage.setItem("accessToken", accessToken);
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;

      return accessToken;
    } catch (err) {
      return rejectWithValue("Token refresh failed");
    }
  }
);

export const loadUserFromToken = () => (dispatch) => {
  const token = localStorage.getItem("accessToken");
  if (!token) return;
  try {
    const userData = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    dispatch(authSlice.actions.setUser({ ...userData, token }));
  } catch (err) {
    console.error("Invalid token", err);
    localStorage.removeItem("accessToken");
  }
};

/* ------------------------- Slice ------------------------- */

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
  },

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      delete axiosInstance.defaults.headers.common["Authorization"];
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // ✅ Only user object
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // ✅ Only user object
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // REFRESH
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
