// src/controllers/dashboardController.js
import prisma from "../models/prismaClient.js";

export const getDashboardData = async (req, res) => {
  try {
    const user = req.user;
    const role = user?.role?.toUpperCase() || "SALES";

    // Role-based visibility
    let whereFilter = {};
    if (role === "SALES") {
      whereFilter = { ownerid: user.id };
    }

    // Parallel data fetch
    const [contacts, deals, tasks] = await Promise.all([
      prisma.contact.findMany({
        where: whereFilter,
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          position: true,
          phone: true,
          ownerid: true,
          createdat: true,
          updatedat: true,
        },
        orderBy: { createdat: "desc" },
      }),
      prisma.deal.findMany({
        where: whereFilter,
        select: {
          id: true,
          title: true,
          value: true,
          stage: true,
          description: true,
          ownerid: true,
          createdat: true,
          updatedat: true,
        },
        orderBy: { createdat: "desc" },
      }),
      prisma.task.findMany({
        where: whereFilter,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          duedate: true,
          ownerid: true,
          createdat: true,
        },
        orderBy: { createdat: "desc" },
      }),
    ]);

    // Stats
    const totalContacts = contacts.length;
    const activeDeals = deals.filter(
      (d) => !String(d.stage).toLowerCase().includes("closed")
    ).length;
    const totalRevenue = deals
      .filter((d) => String(d.stage).toLowerCase() === "closed_won")
      .reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const pipeline = deals
      .filter((d) => !String(d.stage).toLowerCase().includes("closed"))
      .reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const pendingTasks = tasks.filter(
      (t) => String(t.status).toLowerCase() !== "completed"
    ).length;
    const conversionRate = deals.length
      ? Math.round(
          (deals.filter((d) => String(d.stage).toLowerCase() === "closed_won")
            .length /
            deals.length) *
            100
        )
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalContacts,
        activeDeals,
        totalRevenue,
        pipeline,
        pendingTasks,
        conversionRate,
      },
      contacts,
      deals,
      tasks,
    });
  } catch (error) {
    console.error("❌ Dashboard Controller Error:", error);
    res
      .status(500)
      .json({ message: "Failed to load dashboard data", error: error.message });
  }
};
