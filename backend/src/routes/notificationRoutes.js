import express from "express";
import {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(auth); // all notification routes are protected

router.get("/", getNotifications);
router.post("/", createNotification);
router.patch("/:id/read", markAsRead);
router.patch("/mark-all-read", markAllAsRead);
router.delete("/:id", deleteNotification);

export default router;
