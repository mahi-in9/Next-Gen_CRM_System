import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import leadReducer from "../features/leadSlice";
import activityReducer from "../features/activitySlice";
import notificationReducer from "../features/notificationSlice";
import analyticsReducer from "../features/analyticsSlice";
import userReducer from "../features/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    leads: leadReducer,
    activities: activityReducer,
    notifications: notificationReducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
