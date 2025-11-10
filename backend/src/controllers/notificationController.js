// src/controllers/notification.controller.js
import prisma from "../models/prismaClient.js";

/* ============================================================
   📩 Notification Controller
============================================================ */

/**
 * @desc Get all notifications for a specific user
 * @route GET /api/notifications
 * @access Private (Authenticated User)
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id; // ✅ from auth middleware
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ count: notifications.length, notifications });
  } catch (error) {
    console.error("❌ getNotifications:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching notifications." });
  }
};

/**
 * @desc Create a new notification for a user
 * @route POST /api/notifications
 * @access Private (System or Authenticated user)
 */
export const createNotification = async (req, res) => {
  try {
    const { userId, type, message } = req.body;
    if (!userId || !type || !message)
      return res
        .status(400)
        .json({ message: "All fields (userId, type, message) are required." });

    const notification = await prisma.notification.create({
      data: { userId, type, message },
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error("❌ createNotification:", error);
    res
      .status(500)
      .json({ message: "Server error while creating notification." });
  }
};

/**
 * @desc Mark a specific notification as read
 * @route PATCH /api/notifications/:id/read
 * @access Private
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const existing = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });
    if (!existing)
      return res.status(404).json({ message: "Notification not found." });
    if (existing.userId !== userId)
      return res
        .status(403)
        .json({ message: "Unauthorized access to this notification." });

    const updated = await prisma.notification.update({
      where: { id: Number(id) },
      data: { read: true },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("❌ markAsRead:", error);
    res.status(500).json({ message: "Server error while marking as read." });
  }
};

/**
 * @desc Mark all notifications as read for logged-in user
 * @route PATCH /api/notifications/mark-all-read
 * @access Private
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("❌ markAllAsRead:", error);
    res
      .status(500)
      .json({ message: "Server error while updating notifications." });
  }
};

/**
 * @desc Delete a notification
 * @route DELETE /api/notifications/:id
 * @access Private
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });

    if (!notification)
      return res.status(404).json({ message: "Notification not found." });
    if (notification.userId !== userId)
      return res.status(403).json({ message: "Unauthorized action." });

    await prisma.notification.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error("❌ deleteNotification:", error);
    res
      .status(500)
      .json({ message: "Server error while deleting notification." });
  }
};
