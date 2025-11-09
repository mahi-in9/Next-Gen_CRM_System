// src/socket/socketHandler.js
import { addActivityRealtime } from "../features/activitySlice";
import { addNotification } from "../features/notificationSlice";
// import { addLeadRealtime } from "../redux/slices/leadSlice"; // optional if lead slice exists

export const registerSocketEvents = (socket, dispatch) => {
  socket.on("connect", () => {
    console.log("✅ Connected to Socket.io:", socket.id);
  });

  // ---- Lead Created ----
  socket.on("lead:created", (lead) => {
    console.log("📩 New Lead:", lead);
    // dispatch(addLeadRealtime(lead));
  });

  // ---- Activity Created ----
  socket.on("activity:created", (activity) => {
    console.log("📝 New Activity:", activity);
    dispatch(addActivityRealtime(activity));
  });

  // ---- Notification Received ----
  socket.on("notification:new", (notification) => {
    console.log("🔔 Notification:", notification);
    dispatch(addNotification(notification));
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from Socket.io");
  });
};
