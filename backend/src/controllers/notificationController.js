import prisma from "../models/prismaClient.js";

/* ===========================================================
   Notification Controller — Production Ready
   =========================================================== */

/**
 * @desc Get all notifications for the logged-in user
 * @route GET /api/v1/notifications
 * @access Private (User-specific)
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, read } = req.query;

    const filters = { userId };
    if (read !== undefined) filters.read = read === "true";

    const notifications = await prisma.notification.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    const total = await prisma.notification.count({ where: filters });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Mark a single notification as read/unread
 * @route PATCH /api/v1/notifications/:id
 * @access Private
 */
export const updateNotificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { read } = req.body;

    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });

    if (!notification || notification.userId !== userId) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    const updated = await prisma.notification.update({
      where: { id: Number(id) },
      data: { read: !!read },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Mark all notifications as read
 * @route PATCH /api/v1/notifications/mark-all-read
 * @access Private
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res
      .status(200)
      .json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Delete a notification
 * @route DELETE /api/v1/notifications/:id
 * @access Private
 */
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });

    if (!notification || notification.userId !== userId) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    await prisma.notification.delete({ where: { id: Number(id) } });

    res
      .status(200)
      .json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Admin — Create notification manually (optional utility)
 * @route POST /api/v1/notifications
 * @access Admin
 */
export const createNotification = async (req, res) => {
  try {
    const { userId, type, message } = req.body;

    if (!userId || !type || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const notification = await prisma.notification.create({
      data: { userId: Number(userId), type, message },
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
