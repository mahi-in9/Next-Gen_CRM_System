import prisma from "../models/prismaClient.js";

/* =========================================================
   🧱  System History Controller (Admin-only)
========================================================= */

/**
 * @desc  Fetch all system history logs with filters, pagination, and sorting.
 * @route GET /api/history
 * @access Admin only
 */
export const getAllHistory = async (req, res) => {
  try {
    // Query params
    const {
      page = 1,
      limit = 20,
      userId,
      action,
      entityType,
      search,
      sort = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build dynamic filter
    const where = {};
    if (userId) where.userId = Number(userId);
    if (action) where.action = { contains: action, mode: "insensitive" };
    if (entityType)
      where.entityType = { contains: entityType, mode: "insensitive" };
    if (search)
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { entityType: { contains: search, mode: "insensitive" } },
      ];

    const [logs, total] = await Promise.all([
      prisma.systemHistory.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.systemHistory.count({ where }),
    ]);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      logs,
    });
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res
      .status(500)
      .json({ message: "Internal server error while fetching history." });
  }
};

/**
 * @desc  Log a new system history entry.
 * @route POST /api/history
 * @access Internal (called by backend actions)
 */
export const createHistory = async (req, res) => {
  try {
    const { userId, action, entityType, entityId, description } = req.body;

    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "Unknown";

    const log = await prisma.systemHistory.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        description,
        ipAddress,
        userAgent,
      },
    });

    res.status(201).json(log);
  } catch (error) {
    console.error("❌ Error creating history:", error);
    res.status(500).json({ message: "Failed to create history log." });
  }
};

/**
 * @desc  Delete selected or all history logs.
 * @route DELETE /api/history
 * @access Admin only
 */
export const deleteHistory = async (req, res) => {
  try {
    const { ids } = req.body;

    if (Array.isArray(ids) && ids.length > 0) {
      await prisma.systemHistory.deleteMany({ where: { id: { in: ids } } });
      return res.json({ message: `Deleted ${ids.length} history records.` });
    }

    // delete all
    await prisma.systemHistory.deleteMany();
    res.json({ message: "All system history records cleared." });
  } catch (error) {
    console.error("❌ Error deleting history:", error);
    res.status(500).json({ message: "Failed to delete history records." });
  }
};

/**
 * @desc  Cleanup old history logs (e.g., >90 days)
 * @route DELETE /api/history/cleanup
 * @access Admin / scheduled
 */
export const cleanupOldHistory = async (req, res) => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90); // 90-day retention

    const { count } = await prisma.systemHistory.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    res.json({ message: `Removed ${count} old history records.` });
  } catch (error) {
    console.error("❌ Error cleaning history:", error);
    res.status(500).json({ message: "Failed to clean up history." });
  }
};
