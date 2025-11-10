import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

/* =========================================================
   ⚙️ Entity Adapter — Normalized State
========================================================= */
const dealsAdapter = createEntityAdapter({
  selectId: (deal) => deal.id,
  sortComparer: (a, b) => b.createdat.localeCompare(a.createdat),
});

/* =========================================================
   🌐 Async Thunks
========================================================= */

// ✅ Fetch all deals (optionally by stage)
export const fetchDeals = createAsyncThunk(
  "deals/fetchDeals",
  async (stage, { rejectWithValue }) => {
    try {
      const url = stage ? `/deals?stage=${stage}` : `/deals`;
      const res = await axiosInstance.get(url);
      return res.data;
    } catch (err) {
      console.error("❌ [fetchDeals]", err);
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch deals"
      );
    }
  }
);

// ✅ Create a new deal
export const createDeal = createAsyncThunk(
  "deals/createDeal",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/deals`, data);
      return res.data;
    } catch (err) {
      console.error("❌ [createDeal]", err);
      return rejectWithValue(
        err.response?.data?.error || "Failed to create deal"
      );
    }
  }
);

// ✅ Update a deal
export const updateDeal = createAsyncThunk(
  "deals/updateDeal",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/deals/${id}`, data);
      return res.data;
    } catch (err) {
      console.error("❌ [updateDeal]", err);
      return rejectWithValue(
        err.response?.data?.error || "Failed to update deal"
      );
    }
  }
);

// ✅ Update deal stage
export const updateDealStage = createAsyncThunk(
  "deals/updateDealStage",
  async ({ id, stage }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/deals/${id}/stage`, { stage });
      return res.data;
    } catch (err) {
      console.error("❌ [updateDealStage]", err);
      return rejectWithValue(
        err.response?.data?.error || "Failed to update stage"
      );
    }
  }
);

// ✅ Delete a deal
export const deleteDeal = createAsyncThunk(
  "deals/deleteDeal",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/deals/${id}`);
      return id;
    } catch (err) {
      console.error("❌ [deleteDeal]", err);
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete deal"
      );
    }
  }
);

/* =========================================================
   🧱 Initial State
========================================================= */
const initialState = dealsAdapter.getInitialState({
  loading: false,
  error: null,
});

/* =========================================================
   🧩 Slice Definition
========================================================= */
const dealSlice = createSlice({
  name: "deals",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* =========================================================
         🟦 Fetch Deals
      ========================================================== */
      .addCase(fetchDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.loading = false;
        dealsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =========================================================
         🟩 Create Deal
      ========================================================== */
      .addCase(createDeal.fulfilled, (state, action) => {
        dealsAdapter.addOne(state, action.payload);
      })
      .addCase(createDeal.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* =========================================================
         🟧 Update Deal
      ========================================================== */
      .addCase(updateDeal.fulfilled, (state, action) => {
        dealsAdapter.upsertOne(state, action.payload);
      })
      .addCase(updateDeal.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* =========================================================
         🟨 Update Deal Stage
      ========================================================== */
      .addCase(updateDealStage.fulfilled, (state, action) => {
        dealsAdapter.upsertOne(state, action.payload);
      })
      .addCase(updateDealStage.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* =========================================================
         🟥 Delete Deal
      ========================================================== */
      .addCase(deleteDeal.fulfilled, (state, action) => {
        dealsAdapter.removeOne(state, action.payload);
      })
      .addCase(deleteDeal.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default dealSlice.reducer;

/* =========================================================
   🔍 Selectors
========================================================= */
export const {
  selectAll: selectAllDeals,
  selectById: selectDealById,
  selectIds: selectDealIds,
} = dealsAdapter.getSelectors((state) => state.deals);

export const selectDealsLoading = (state) => state.deals.loading;
export const selectDealsError = (state) => state.deals.error;
export const selectDealsByStage = (state, stage) =>
  selectAllDeals(state).filter((deal) => deal.stage === stage);
