import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

/* =========================================================
   ⚙️ Entity Adapter — Normalized State
========================================================= */
const tasksAdapter = createEntityAdapter({
  selectId: (task) => task.id,
  sortComparer: (a, b) => new Date(b.createdat) - new Date(a.createdat),
});

/* =========================================================
   🌐 Async Thunks
========================================================= */

/**
 * ✅ GET /api/v1/tasks
 * Optionally filter by status or priority.
 */
export const fetchTasks = createAsyncThunk(
  "tasks/fetchAll",
  async ({ status, priority } = {}, { rejectWithValue }) => {
    try {
      let url = "/tasks";
      const params = [];
      if (status) params.push(`status=${status}`);
      if (priority) params.push(`priority=${priority}`);
      if (params.length) url += `?${params.join("&")}`;
      const { data } = await axiosInstance.get(url);
      return data;
    } catch (err) {
      console.error("❌ [fetchTasks]", err);
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch tasks"
      );
    }
  }
);

/**
 * ✅ POST /api/v1/tasks
 */
export const createTask = createAsyncThunk(
  "tasks/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/tasks", payload);
      return data;
    } catch (err) {
      console.error("❌ [createTask]", err);
      return rejectWithValue(
        err.response?.data?.error || "Failed to create task"
      );
    }
  }
);

/**
 * ✅ PATCH /api/v1/tasks/:id
 */
export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, data: updateData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/tasks/${id}`, updateData);
      return data;
    } catch (err) {
      console.error("❌ [updateTask]", err);
      return rejectWithValue(
        err.response?.data?.error || "Failed to update task"
      );
    }
  }
);

/**
 * ✅ PATCH /api/v1/tasks/:id/status
 */
export const updateTaskStatus = createAsyncThunk(
  "tasks/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/tasks/${id}/status`, {
        status,
      });
      return data;
    } catch (err) {
      console.error("❌ [updateTaskStatus]", err);
      return rejectWithValue(
        err.response?.data?.error || "Failed to update status"
      );
    }
  }
);

/**
 * ✅ DELETE /api/v1/tasks/:id
 */
export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      return id;
    } catch (err) {
      console.error("❌ [deleteTask]", err);
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete task"
      );
    }
  }
);

/* =========================================================
   🧱 Initial State
========================================================= */
const initialState = tasksAdapter.getInitialState({
  loading: false,
  error: null,
});

/* =========================================================
   🧩 Slice Definition
========================================================= */
const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTasks: (state) => {
      tasksAdapter.removeAll(state);
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* =========================================================
         🟦 Fetch Tasks
      ========================================================== */
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        tasksAdapter.setAll(state, action.payload);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =========================================================
         🟩 Create Task
      ========================================================== */
      .addCase(createTask.fulfilled, (state, action) => {
        tasksAdapter.addOne(state, action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* =========================================================
         🟧 Update Task
      ========================================================== */
      .addCase(updateTask.fulfilled, (state, action) => {
        tasksAdapter.upsertOne(state, action.payload);
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* =========================================================
         🟨 Update Task Status
      ========================================================== */
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        tasksAdapter.upsertOne(state, action.payload);
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* =========================================================
         🟥 Delete Task
      ========================================================== */
      .addCase(deleteTask.fulfilled, (state, action) => {
        tasksAdapter.removeOne(state, action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;

/* =========================================================
   🔍 Selectors
========================================================= */
export const {
  selectAll: selectAllTasks,
  selectById: selectTaskById,
  selectIds: selectTaskIds,
} = tasksAdapter.getSelectors((state) => state.tasks);

export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;
export const selectTasksByStatus = (state, status) =>
  selectAllTasks(state).filter((task) => task.status === status);
export const selectTasksByPriority = (state, priority) =>
  selectAllTasks(state).filter((task) => task.priority === priority);
