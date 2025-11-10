// src/controllers/analyticsController.js
import prisma from "../models/prismaClient.js";

/**
 * 📊 getAnalyticsOverview (Deal + Task + System History Overview)
 * Aggregates company-wide metrics for dashboard analytics.
 */
export const getAnalyticsOverview = async (req, res) => {
  try {
    /* =======================================================
       1️⃣ Summary Statistics
       ======================================================= */
    const [totalDeals, totalUsers, totalTasks, totalSystemLogs] =
      await Promise.all([
        prisma.deal.count(),
        prisma.user.count(),
        prisma.task.count(),
        prisma.system_history.count(),
      ]);

    const summary = {
      totalDeals,
      totalUsers,
      totalTasks,
      totalSystemLogs,
    };

    /* =======================================================
       2️⃣ Deals by Stage (Chart Data)
       ======================================================= */
    const dealsByStageRaw = await prisma.deal.groupBy({
      by: ["stage"],
      _count: { stage: true },
      orderBy: { _count: { stage: "desc" } },
    });

    const dealsByStage = dealsByStageRaw.map((s) => ({
      stage: s.stage,
      count: s._count.stage,
    }));

    /* =======================================================
       3️⃣ Top Performers (Users with Most Deals)
       ======================================================= */
    const topPerformersRaw = await prisma.deal.groupBy({
      by: ["ownerid"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const topPerformers = await Promise.all(
      topPerformersRaw
        .filter((p) => p.ownerid !== null)
        .map(async (p) => {
          const user = await prisma.user.findUnique({
            where: { id: p.ownerid },
            select: { id: true, name: true, email: true, role: true },
          });
          return {
            ownerId: p.ownerid,
            deals: p._count.id,
            user: user || { name: "Unknown", email: "N/A", role: "N/A" },
          };
        })
    );

    /* =======================================================
       4️⃣ Recent System Activity (Audit Trail)
       ======================================================= */
    const recentHistoriesRaw = await prisma.system_history.findMany({
      orderBy: { createdat: "desc" },
      take: 10,
      include: {
        users: { select: { id: true, name: true, role: true } },
      },
    });

    const recentHistories = recentHistoriesRaw.map((h) => ({
      id: h.id,
      user: h.users,
      action: h.action,
      entityType: h.entitytype,
      entityId: h.entityid,
      description: h.description,
      timeStamp: h.createdat,
    }));

    /* =======================================================
       ✅ Response
       ======================================================= */
    res.status(200).json({
      summary,
      dealsByStage,
      topPerformers,
      recentHistories,
    });
  } catch (error) {
    console.error("❌ Analytics Controller Error:", error);
    res.status(500).json({
      message: "Failed to load analytics data",
      error: error.message,
    });
  }
};
