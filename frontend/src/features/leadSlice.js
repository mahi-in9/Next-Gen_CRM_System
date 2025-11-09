import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

/* =======================================================
   🎯 Async Thunks
======================================================= */

// ✅ Fetch all leads for the logged-in user
export const fetchLeads = createAsyncThunk(
  "leads/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/leads");
      return res.data.leads;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leads"
      );
    }
  }
);

// ✅ Create a new lead
export const createLead = createAsyncThunk(
  "leads/create",
  async (leadData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/leads", leadData);
      return res.data.lead;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create lead"
      );
    }
  }
);

// ✅ Update an existing lead
export const updateLead = createAsyncThunk(
  "leads/update",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/leads/${id}`, updates);
      return res.data.lead;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update lead"
      );
    }
  }
);

// ✅ Delete a lead
export const deleteLead = createAsyncThunk(
  "leads/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/leads/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete lead"
      );
    }
  }
);

/* =======================================================
   🧩 Slice Definition
======================================================= */

const leadSlice = createSlice({
  name: "leads",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearLeadError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all leads
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create new lead
      .addCase(createLead.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      // Update lead
      .addCase(updateLead.fulfilled, (state, action) => {
        const idx = state.list.findIndex(
          (lead) => lead.id === action.payload.id
        );
        if (idx !== -1) state.list[idx] = action.payload;
      })

      // Delete lead
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.list = state.list.filter((lead) => lead.id !== action.payload);
      });
  },
});

export const { clearLeadError } = leadSlice.actions;
export default leadSlice.reducer;
