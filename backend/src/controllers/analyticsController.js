// src/controllers/analytics.controller.js
import prisma from "../models/prismaClient.js";

/* =======================================================
   📊 Analytics Controller
======================================================= */

export const getAnalyticsOverview = async (req, res) => {
  try {
    const totalLeads = await prisma.lead.count();
    const totalUsers = await prisma.user.count();
    const totalActivities = await prisma.activity.count();
    const totalHistories = await prisma.leadHistory.count();

    const leadsByStage = await prisma.lead.groupBy({
      by: ["stage"],
      _count: { stage: true },
    });

    const recentHistories = await prisma.leadHistory.findMany({
      orderBy: { timeStamp: "desc" },
      take: 10,
      include: {
        lead: { select: { name: true } },
        user: { select: { name: true } },
      },
    });

    const topPerformers = await prisma.lead.groupBy({
      by: ["ownerId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const enrichedPerformers = await Promise.all(
      topPerformers.map(async (p) => {
        const user = await prisma.user.findUnique({
          where: { id: p.ownerId },
          select: { name: true, email: true },
        });
        return { ...p, user };
      })
    );

    res.status(200).json({
      summary: { totalLeads, totalUsers, totalActivities, totalHistories },
      leadsByStage,
      topPerformers: enrichedPerformers,
      recentHistories,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};
