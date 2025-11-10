import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import leadReducer from "../features/leadSlice";
import activityReducer from "../features/activitySlice";
import notificationReducer from "../features/notificationSlice";
import analyticsReducer from "../features/analyticsSlice";
import userReducer from "../features/userSlice";
import dashboardReducer from "../features/dashboardSlice";
import contactReducer from "../features/contactSlice";
import dealReducer from "../features/dealSlice";
import tasksReducer from "../features/tasksSlice";
import historyReducer from "../features/historySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    leads: leadReducer,
    activities: activityReducer,
    notifications: notificationReducer,
    analytics: analyticsReducer,
    dashboard: dashboardReducer,
    contacts: contactReducer,
    deals: dealReducer,
    tasks: tasksReducer,
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
