// src/sockets/socket.js
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";

export const initializeSocket = (io) => {
  io.engine.on("connection_error", (err) => {
    console.error("Socket.io engine error:", err);
  });

  io.on("connection", async (socket) => {
    console.log("🟢 Client connected:", socket.id);

    const token = socket.handshake.auth?.token;
    if (!token) {
      socket.emit("auth:error", "No token provided");
      return setTimeout(() => socket.disconnect(true), 500);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, role: true },
      });
      if (!user) throw new Error("User not found");

      socket.data.user = user;
      socket.join(`user_${user.id}`);
      socket.join(`role_${user.role.toLowerCase()}`);
      console.log(`👤 ${user.name} (${user.role}) connected`);

      // Activity event
      socket.on("activity:created", (data) => {
        io.to("role_admin").emit("activity:created", data);
      });

      // Lead event
      socket.on("lead:created", (data) => {
        io.to("role_admin").emit("lead:created", data);
      });

      // Notification event
      socket.on("notification:send", async ({ userId, message, type }) => {
        try {
          const notification = await prisma.notification.create({
            data: { userId, message, type },
          });
          io.to(`user_${userId}`).emit("notification:new", notification);
          console.log(`🔔 Sent to user_${userId}`);
        } catch (err) {
          console.error("❌ Notification error:", err.message);
        }
      });

      socket.on("disconnect", (reason) => {
        console.log(`🔴 ${user.name} disconnected (${reason})`);
      });
    } catch (err) {
      console.error("❌ Socket auth error:", err.message);
      socket.emit("auth:error", "Unauthorized");
      setTimeout(() => socket.disconnect(true), 500);
    }
  });
};
