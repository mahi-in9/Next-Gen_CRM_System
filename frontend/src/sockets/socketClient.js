import { io } from "socket.io-client";

export const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected to Socket.io:", socket.id);
});

socket.on("lead:created", (data) => {
  console.log("New lead added:", data);
});

socket.on("activity:created", (data) => {
  console.log("Activity added:", data);
});

socket.on("notification:new", (data) => {
  console.log("New notification:", data);
});
