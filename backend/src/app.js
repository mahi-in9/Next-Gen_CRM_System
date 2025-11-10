import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";
import taskRoutes from "./routes/tasksRoutes.js";

import prisma from "./models/prismaClient.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// app.use("/", (req, res) => {
//   res.send("app is running");
// });

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/leads", leadRoutes);
app.use("/api/v1/activities", activityRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/history", historyRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/contacts", contactRoutes);
app.use("/api/v1/deals", dealRoutes);
app.use("/api/v1/tasks", taskRoutes);

const PORT = process.env.PORT;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  }
}

startServer();

export default app;
