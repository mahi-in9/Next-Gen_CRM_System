// src/sockets/socket.js
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";

export const initializeSocket = (io) => {
  io.on("connection", async (socket) => {
    console.log("🟢 Client connected:", socket.id);

    /* ---------------------- 1️⃣ Authentication ---------------------- */
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.log("❌ No auth token provided — disconnecting socket");
      socket.disconnect(true);
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, role: true },
      });

      if (!user) {
        socket.disconnect(true);
        return;
      }

      // ✅ Join user-specific notification room
      const userRoom = `user_${user.id}`;
      socket.join(userRoom);
      console.log(`👤 User ${user.name} joined room ${userRoom}`);

      /* ---------------------- 2️⃣ Event Listeners ---------------------- */

      // Optional: join other logical rooms if needed later (e.g. team, org)
      socket.on("joinRoom", (roomName) => {
        socket.join(roomName);
        console.log(`🟣 ${user.name} joined room: ${roomName}`);
      });

      // Activity created
      socket.on("activity:created", (data) => {
        console.log("📢 activity:created (server broadcast)", data);
        io.emit("activity:created", data);
      });

      // Lead created
      socket.on("lead:created", (data) => {
        console.log("📢 lead:created (server broadcast)", data);
        io.emit("lead:created", data);
      });

      // Notification broadcast
      socket.on("notification:send", async ({ userId, message, type }) => {
        const notification = await prisma.notification.create({
          data: { userId, message, type },
        });

        io.to(`user_${userId}`).emit("notification:new", notification);
        console.log(`🔔 Notification sent to user_${userId}`);
      });

      /* ---------------------- 3️⃣ Disconnect ---------------------- */
      socket.on("disconnect", (reason) => {
        console.log(`🔴 ${user.name} disconnected (${reason})`);
      });
    } catch (err) {
      console.error("❌ Socket authentication error:", err.message);
      socket.disconnect(true);
    }
  });
};
