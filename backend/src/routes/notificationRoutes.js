import express from "express";
import {
  getUserNotifications,
  updateNotificationStatus,
  markAllAsRead,
  deleteNotification,
  createNotification,
} from "../controllers/notificationController.js";
import { auth, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User-specific notifications
router.get("/", auth, getUserNotifications);
router.patch("/mark-all-read", auth, markAllAsRead);
router.patch("/:id", auth, updateNotificationStatus);
router.delete("/:id", auth, deleteNotification);

// Admin-only route (optional)
router.post("/", auth, authorize(["ADMIN"]), createNotification);

export default router;
