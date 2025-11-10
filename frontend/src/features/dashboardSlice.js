import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

/* =========================================================
   ⚙️ Entity Adapters
========================================================= */
const contactsAdapter = createEntityAdapter({ selectId: (c) => c.id });
const dealsAdapter = createEntityAdapter({ selectId: (d) => d.id });
const tasksAdapter = createEntityAdapter({ selectId: (t) => t.id });

/* =========================================================
   🌐 Thunk: Fetch Dashboard Data
   - Endpoint: /api/dashboard
   - Returns { contacts, deals, tasks }
========================================================= */
export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (_, { rejectWithValue, signal }) => {
    const MAX_RETRIES = 2;
    let attempt = 0;
    let error;

    while (attempt <= MAX_RETRIES) {
      try {
        const { data } = await axiosInstance.get("/dashboard", { signal });
        // Expecting: { contacts, deals, tasks }
        return data;
      } catch (err) {
        error = err;
        if (
          err.response &&
          err.response.status >= 400 &&
          err.response.status < 500
        )
          break;
        attempt++;
        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }

    return rejectWithValue(
      error?.response?.data || { message: error?.message || "Network error" }
    );
  },
  {
    condition: (_, { getState }) => {
      const { dashboard } = getState();
      if (dashboard.loading === "pending") return false;
      return true;
    },
  }
);

/* =========================================================
   🧱 Initial State
========================================================= */
const initialState = {
  contacts: contactsAdapter.getInitialState(),
  deals: dealsAdapter.getInitialState(),
  tasks: tasksAdapter.getInitialState(),
  loading: "idle", // "idle" | "pending" | "succeeded" | "failed"
  error: null,
  lastFetched: null,
};

/* =========================================================
   🧩 Slice
========================================================= */
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboard: (state) => {
      contactsAdapter.removeAll(state.contacts);
      dealsAdapter.removeAll(state.deals);
      tasksAdapter.removeAll(state.tasks);
      state.error = null;
      state.loading = "idle";
      state.lastFetched = null;
    },
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        const { contacts = [], deals = [], tasks = [] } = action.payload;
        contactsAdapter.setAll(state.contacts, contacts);
        dealsAdapter.setAll(state.deals, deals);
        tasksAdapter.setAll(state.tasks, tasks);
        state.loading = "succeeded";
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = "failed";
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch dashboard";
      });
  },
});

export const { clearDashboard, clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

/* =========================================================
   📊 Selectors
========================================================= */
export const contactsSelectors = contactsAdapter.getSelectors(
  (state) => state.dashboard.contacts
);
export const dealsSelectors = dealsAdapter.getSelectors(
  (state) => state.dashboard.deals
);
export const tasksSelectors = tasksAdapter.getSelectors(
  (state) => state.dashboard.tasks
);

export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectDashboardLastFetched = (state) =>
  state.dashboard.lastFetched;

/* =========================================================
   📈 Derived Data (Memoized Selectors)
========================================================= */

// Total dashboard stats
export const selectDashboardStats = createSelector(
  [
    contactsSelectors.selectAll,
    dealsSelectors.selectAll,
    tasksSelectors.selectAll,
  ],
  (contacts, deals, tasks) => {
    const totalContacts = contacts.length;
    const activeDeals = deals.filter(
      (d) =>
        !String(d.stage || "")
          .toLowerCase()
          .includes("closed")
    ).length;
    const totalRevenue = deals
      .filter((d) => String(d.stage || "").toLowerCase() === "closed_won")
      .reduce((sum, d) => sum + Number(d.value || 0), 0);
    const pipeline = deals
      .filter(
        (d) =>
          !String(d.stage || "")
            .toLowerCase()
            .includes("closed")
      )
      .reduce((sum, d) => sum + Number(d.value || 0), 0);
    const pendingTasks = tasks.filter(
      (t) => String(t.status || "").toLowerCase() !== "completed"
    ).length;
    const conversionRate = deals.length
      ? Math.round(
          (deals.filter(
            (d) => String(d.stage || "").toLowerCase() === "closed_won"
          ).length /
            deals.length) *
            100
        )
      : 0;

    return {
      totalContacts,
      activeDeals,
      totalRevenue,
      pipeline,
      pendingTasks,
      conversionRate,
    };
  }
);

/* =========================================================
   🧮 Additional Selectors
========================================================= */

// Deals grouped by stage (for charts)
export const selectDealsByStage = createSelector(
  dealsSelectors.selectAll,
  (deals) => {
    const grouped = {};
    deals.forEach((deal) => {
      const stage = deal.stage || "Unknown";
      grouped[stage] = (grouped[stage] || 0) + 1;
    });
    return Object.entries(grouped).map(([stage, count]) => ({
      stage,
      count,
    }));
  }
);

// Upcoming tasks (not completed, sorted by dueDate)
export const selectUpcomingTasks = createSelector(
  tasksSelectors.selectAll,
  (tasks) =>
    tasks
      .filter((t) => String(t.status || "").toLowerCase() !== "completed")
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
);
