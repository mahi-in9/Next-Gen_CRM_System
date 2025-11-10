import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

/* =========================================================
   ⚙️  Entity Adapter (Normalized State)
========================================================= */
const contactsAdapter = createEntityAdapter({
  selectId: (contact) => contact.id,
  sortComparer: (a, b) => b.createdat.localeCompare(a.createdat),
});

/* =========================================================
   🌐 Async Thunks
========================================================= */

/* ✅ GET /api/contacts */
export const fetchContacts = createAsyncThunk(
  "contacts/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/contacts");
      return data;
    } catch (err) {
      console.error("❌ fetchContacts error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to load contacts"
      );
    }
  }
);

/* ✅ POST /api/contacts */
export const createContact = createAsyncThunk(
  "contacts/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/contacts", payload);
      return data;
    } catch (err) {
      console.error("❌ createContact error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to create contact"
      );
    }
  }
);

/* ✅ PATCH /api/contacts/:id */
export const updateContact = createAsyncThunk(
  "contacts/update",
  async ({ id, data: updateData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/contacts/${id}`, updateData);
      return data;
    } catch (err) {
      console.error("❌ updateContact error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to update contact"
      );
    }
  }
);

/* ✅ DELETE /api/contacts/:id */
export const deleteContact = createAsyncThunk(
  "contacts/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/contacts/${id}`);
      return id;
    } catch (err) {
      console.error("❌ deleteContact error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete contact"
      );
    }
  }
);

/* ✅ GET /api/contacts/:id/activities */
export const fetchContactActivities = createAsyncThunk(
  "contacts/fetchActivities",
  async (contactId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(
        `/contacts/${contactId}/activities`
      );
      return { contactId, activities: data };
    } catch (err) {
      console.error("❌ fetchContactActivities error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch activities"
      );
    }
  }
);

/* ✅ POST /api/activities */
export const createContactActivity = createAsyncThunk(
  "contacts/createActivity",
  async ({ contactId, type = "Note", content }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/activities`, {
        contactId,
        type,
        content,
      });
      return { contactId, activity: data };
    } catch (err) {
      console.error("❌ createContactActivity error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to create activity"
      );
    }
  }
);

/* =========================================================
   🧱 Initial State
========================================================= */
const initialState = contactsAdapter.getInitialState({
  activities: {}, // key = contactId, value = activity[]
  loading: false,
  error: null,
  selectedId: null,
});

/* =========================================================
   🧩 Slice
========================================================= */
const contactSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    clearContacts: (state) => {
      contactsAdapter.removeAll(state);
      state.activities = {};
      state.error = null;
      state.loading = false;
      state.selectedId = null;
    },
    setSelectedContact: (state, action) => {
      state.selectedId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- Fetch All ---------- */
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        contactsAdapter.setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Create ---------- */
      .addCase(createContact.pending, (state) => {
        state.loading = true;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        contactsAdapter.addOne(state, action.payload);
        state.loading = false;
      })
      .addCase(createContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Update ---------- */
      .addCase(updateContact.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        contactsAdapter.upsertOne(state, action.payload);
        state.loading = false;
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Delete ---------- */
      .addCase(deleteContact.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        contactsAdapter.removeOne(state, action.payload);
        state.loading = false;
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Activities (GET) ---------- */
      .addCase(fetchContactActivities.fulfilled, (state, action) => {
        const { contactId, activities } = action.payload;
        state.activities[contactId] = activities;
      })
      .addCase(fetchContactActivities.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ---------- Activities (POST) ---------- */
      .addCase(createContactActivity.fulfilled, (state, action) => {
        const { contactId, activity } = action.payload;
        if (!state.activities[contactId]) state.activities[contactId] = [];
        state.activities[contactId].unshift(activity);
      })
      .addCase(createContactActivity.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

/* =========================================================
   🧠 Selectors
========================================================= */
export const contactsSelectors = contactsAdapter.getSelectors(
  (state) => state.contacts
);

export const selectAllContacts = (state) => contactsSelectors.selectAll(state);

export const selectContactById = (state, id) =>
  contactsSelectors.selectById(state, id);

export const selectContactsLoading = (state) => state.contacts.loading;
export const selectContactsError = (state) => state.contacts.error;
export const selectSelectedContactId = (state) => state.contacts.selectedId;

export const selectActivitiesByContact = (state, contactId) =>
  state.contacts.activities[contactId] || [];

/* =========================================================
   ⚙️ Exports
========================================================= */
export const { clearContacts, setSelectedContact } = contactSlice.actions;
export default contactSlice.reducer;
